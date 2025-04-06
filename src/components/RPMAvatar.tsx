import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SkinnedMesh, Bone } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Viseme map for lip-sync with more subtle, realistic mappings
const VISEME_MAP = {
  'sil': { viseme: 'viseme_sil', value: 0.0, jaw: 0.0 },
  'PP': { viseme: 'viseme_PP', value: 0.4, jaw: 0.05 },  // b, p, m - closed lips
  'FF': { viseme: 'viseme_FF', value: 0.35, jaw: 0.08 }, // f, v - teeth touching lips
  'TH': { viseme: 'viseme_TH', value: 0.3, jaw: 0.1 },   // th - tongue between teeth
  'DD': { viseme: 'viseme_DD', value: 0.35, jaw: 0.15 }, // d, t, n - tongue at roof
  'kk': { viseme: 'viseme_kk', value: 0.3, jaw: 0.15 },  // k, g - back of mouth
  'CH': { viseme: 'viseme_CH', value: 0.35, jaw: 0.12 }, // ch, j, sh - rounded and forward
  'SS': { viseme: 'viseme_SS', value: 0.35, jaw: 0.08 }, // s, z - teeth close, lips wide
  'nn': { viseme: 'viseme_nn', value: 0.3, jaw: 0.1 },   // n - tongue at roof, relaxed
  'RR': { viseme: 'viseme_RR', value: 0.35, jaw: 0.15 }, // r - slight rounding
  'aa': { viseme: 'viseme_aa', value: 0.45, jaw: 0.2 },  // ah - open mouth
  'E':  { viseme: 'viseme_E', value: 0.35, jaw: 0.15 },  // eh - partial open
  'ih': { viseme: 'viseme_I', value: 0.3, jaw: 0.12 },   // ih - slightly open, spread
  'oh': { viseme: 'viseme_O', value: 0.4, jaw: 0.18 },   // oh - rounded open
  'ou': { viseme: 'viseme_U', value: 0.35, jaw: 0.15 }   // oo - very rounded, small
};

// Mapping between common text characters and phonemes
const CHAR_TO_PHONEME_MAP: Record<string, string> = {
  'a': 'aa', 'ā': 'aa', 'à': 'aa', 'á': 'aa', 'â': 'aa', 'ä': 'aa',
  'e': 'E', 'ē': 'E', 'è': 'E', 'é': 'E', 'ê': 'E', 'ë': 'E',
  'i': 'ih', 'ī': 'ih', 'ì': 'ih', 'í': 'ih', 'î': 'ih', 'ï': 'ih',
  'o': 'oh', 'ō': 'oh', 'ò': 'oh', 'ó': 'oh', 'ô': 'oh', 'ö': 'oh',
  'u': 'ou', 'ū': 'ou', 'ù': 'ou', 'ú': 'ou', 'û': 'ou', 'ü': 'ou',
  'y': 'ih',
  'b': 'PP', 'p': 'PP', 'm': 'PP',
  'f': 'FF', 'v': 'FF', 
  't': 'DD', 'd': 'DD', 'n': 'nn',
  'k': 'kk', 'g': 'kk', 'c': 'kk',
  'r': 'RR', 'l': 'RR',
  's': 'SS', 'z': 'SS',
  'h': 'TH',
  'j': 'CH', 'ch': 'CH', 'sh': 'CH'
};

// ARKit blendshape mapping
const BLENDSHAPES = {
  BROWS: {
    INNER_UP: 'browInnerUp',
    DOWN_LEFT: 'browDownLeft',
    DOWN_RIGHT: 'browDownRight',
    OUTER_UP_LEFT: 'browOuterUpLeft',
    OUTER_UP_RIGHT: 'browOuterUpRight'
  },
  EYES: {
    BLINK_LEFT: 'eyeBlinkLeft',
    BLINK_RIGHT: 'eyeBlinkRight',
    SQUINT_LEFT: 'eyeSquintLeft',
    SQUINT_RIGHT: 'eyeSquintRight',
    WIDE_LEFT: 'eyeWideLeft',
    WIDE_RIGHT: 'eyeWideRight',
    LOOK_UP_LEFT: 'eyeLookUpLeft',
    LOOK_UP_RIGHT: 'eyeLookUpRight',
    LOOK_DOWN_LEFT: 'eyeLookDownLeft',
    LOOK_DOWN_RIGHT: 'eyeLookDownRight',
    LOOK_IN_LEFT: 'eyeLookInLeft',
    LOOK_IN_RIGHT: 'eyeLookInRight',
    LOOK_OUT_LEFT: 'eyeLookOutLeft',
    LOOK_OUT_RIGHT: 'eyeLookOutRight'
  },
  CHEEKS: {
    PUFF: 'cheekPuff',
    SQUINT_LEFT: 'cheekSquintLeft',
    SQUINT_RIGHT: 'cheekSquintRight'
  },
  NOSE: {
    SNEER_LEFT: 'noseSneerLeft',
    SNEER_RIGHT: 'noseSneerRight'
  },
  MOUTH: {
    FUNNEL: 'mouthFunnel',
    PUCKER: 'mouthPucker',
    SHRUG_UPPER: 'mouthShrugUpper',
    SHRUG_LOWER: 'mouthShrugLower',
    ROLL_UPPER: 'mouthRollUpper',
    ROLL_LOWER: 'mouthRollLower',
    LEFT: 'mouthLeft',
    RIGHT: 'mouthRight',
    UP: 'mouthUpperUp',
    DOWN: 'mouthLowerDown',
    ANGRY: 'mouthAngry',
    FUN: 'mouthFun',
    JOY: 'mouthJoy',
    SORROW: 'mouthSorrow',
    SURPRISED: 'mouthSurprised',
    A: 'mouthA',
    I: 'mouthI',
    U: 'mouthU',
    E: 'mouthE',
    O: 'mouthO',
    OPEN: 'mouthOpen',
    SMILE_LEFT: 'mouthSmileLeft',
    SMILE_RIGHT: 'mouthSmileRight',
    FROWN_LEFT: 'mouthFrownLeft',
    FROWN_RIGHT: 'mouthFrownRight',
    PRESS_LEFT: 'mouthPressLeft',
    PRESS_RIGHT: 'mouthPressRight',
    DIMPLE_LEFT: 'mouthDimpleLeft',
    DIMPLE_RIGHT: 'mouthDimpleRight',
    STRETCH_LEFT: 'mouthStretchLeft',
    STRETCH_RIGHT: 'mouthStretchRight',
    CLOSE: 'mouthClose'
  },
  JAW: {
    OPEN: 'jawOpen',
    FORWARD: 'jawForward',
    LEFT: 'jawLeft',
    RIGHT: 'jawRight'
  },
  TONGUE: {
    OUT: 'tongueOut'
  }
};

interface RPMAvatarProps {
  avatarUrl: string;
  currentState: string;
  isSpeaking?: boolean;
  speechText?: string;
  speechEvents?: Array<{ type: 'start' | 'end' | 'boundary'; value: string }>;
  selectedEnvironment?: string;
}

// Define animation URLs
const ANIMATIONS = {
  idle: '/animations/idle.fbx',
  talking: '/animations/talking.fbx',
  listening: '/animations/listening.fbx',
  thinking: '/animations/thinking.fbx',
  test: '/animations/wave.fbx'  // Add a simple wave animation for testing
};

// Add built-in animation names
const BUILT_IN_ANIMATIONS = [
  'idle1',
  'idle2',
  'idle3_hand_hips',
  'talking1',
  'talking2_head_shake',
  'talking3'
];

// Define talking animations for random selection
const TALKING_ANIMATIONS = [
  'talking1',
  'talking2_head_shake',
  'talking3'
];

// Define all available morph targets
const MORPH_TARGETS = {
  // Full face expressions
  FULL_FACE: {
    NEUTRAL: 'Face.M_F00_000_00_Fcl_ALL_Neutral',
    ANGRY: 'Face.M_F00_000_00_Fcl_ALL_Angry',
    FUN: 'Face.M_F00_000_00_Fcl_ALL_Fun',
    JOY: 'Face.M_F00_000_00_Fcl_ALL_Joy',
    SORROW: 'Face.M_F00_000_00_Fcl_ALL_Sorrow',
    SURPRISED: 'Face.M_F00_000_00_Fcl_ALL_Surprised'
  },
  // Eyebrows
  EYEBROW: {
    ANGRY: 'Face.M_F00_000_00_Fcl_BRW_Angry',
    FUN: 'Face.M_F00_000_00_Fcl_BRW_Fun',
    JOY: 'Face.M_F00_000_00_Fcl_BRW_Joy',
    SORROW: 'Face.M_F00_000_00_Fcl_BRW_Sorrow',
    SURPRISED: 'Face.M_F00_000_00_Fcl_BRW_Surprised'
  },
  // Eyes
  EYE: {
    NATURAL: 'Face.M_F00_000_00_Fcl_EYE_Natural',
    ANGRY: 'Face.M_F00_000_00_Fcl_EYE_Angry',
    CLOSE: 'Face.M_F00_000_00_Fcl_EYE_Close',
    CLOSE_R: 'Face.M_F00_000_00_Fcl_EYE_Close_R',
    CLOSE_L: 'Face.M_F00_000_00_Fcl_EYE_Close_L',
    FUN: 'Face.M_F00_000_00_Fcl_Eye_Fun',
    JOY: 'Face.M_F00_000_00_Fcl_EYE_Joy',
    SORROW: 'Face.M_F00_000_00_Fcl_EYE_Sorrow',
    SURPRISED: 'Face.M_F00_000_00_Fcl_EYE_Surprised',
    SPREAD: 'Face.M_F00_000_00_Fcl_EYE_Spread'
  },
  // Mouth
  MOUTH: {
    NEUTRAL: 'Face.M_F00_000_00_Fcl_MTH_Neutral',
    UP: 'Face.M_F00_000_00_Fcl_MTH_Up',
    DOWN: 'Face.M_F00_000_00_Fcl_MTH_Down',
    ANGRY: 'Face.M_F00_000_00_Fcl_MTH_Angry',
    FUN: 'Face.M_F00_000_00_Fcl_MTH_Fun',
    JOY: 'Face.M_F00_000_00_Fcl_MTH_Joy',
    SORROW: 'Face.M_F00_000_00_Fcl_MTH_Sorrow',
    SURPRISED: 'Face.M_F00_000_00_Fcl_MTH_Surprised',
    // Phonemes
    A: 'Face.M_F00_000_00_Fcl_MTH_A',
    I: 'Face.M_F00_000_00_Fcl_MTH_I',
    U: 'Face.M_F00_000_00_Fcl_MTH_U',
    E: 'Face.M_F00_000_00_Fcl_MTH_E',
    O: 'Face.M_F00_000_00_Fcl_MTH_O'
  }
};

// Intensity values for each morph target type
const MORPH_INTENSITIES = {
  // Full face expressions
  [MORPH_TARGETS.FULL_FACE.NEUTRAL]: 0.0,
  [MORPH_TARGETS.FULL_FACE.ANGRY]: 0.7,
  [MORPH_TARGETS.FULL_FACE.FUN]: 0.7,
  [MORPH_TARGETS.FULL_FACE.JOY]: 0.7,
  [MORPH_TARGETS.FULL_FACE.SORROW]: 0.7,
  [MORPH_TARGETS.FULL_FACE.SURPRISED]: 0.7,
  
  // Eyebrows
  [MORPH_TARGETS.EYEBROW.ANGRY]: 0.8,
  [MORPH_TARGETS.EYEBROW.FUN]: 0.6,
  [MORPH_TARGETS.EYEBROW.JOY]: 0.6,
  [MORPH_TARGETS.EYEBROW.SORROW]: 0.7,
  [MORPH_TARGETS.EYEBROW.SURPRISED]: 0.8,
  
  // Eyes
  [MORPH_TARGETS.EYE.NATURAL]: 0.5,
  [MORPH_TARGETS.EYE.ANGRY]: 0.7,
  [MORPH_TARGETS.EYE.CLOSE]: 1.0,
  [MORPH_TARGETS.EYE.CLOSE_R]: 1.0,
  [MORPH_TARGETS.EYE.CLOSE_L]: 1.0,
  [MORPH_TARGETS.EYE.FUN]: 0.6,
  [MORPH_TARGETS.EYE.JOY]: 0.6,
  [MORPH_TARGETS.EYE.SORROW]: 0.7,
  [MORPH_TARGETS.EYE.SURPRISED]: 0.8,
  [MORPH_TARGETS.EYE.SPREAD]: 0.4,
  
  // Mouth phonemes and expressions
  [MORPH_TARGETS.MOUTH.NEUTRAL]: 0.0,
  [MORPH_TARGETS.MOUTH.UP]: 0.5,
  [MORPH_TARGETS.MOUTH.DOWN]: 0.5,
  [MORPH_TARGETS.MOUTH.ANGRY]: 0.7,
  [MORPH_TARGETS.MOUTH.FUN]: 0.6,
  [MORPH_TARGETS.MOUTH.JOY]: 0.7,
  [MORPH_TARGETS.MOUTH.SORROW]: 0.7,
  [MORPH_TARGETS.MOUTH.SURPRISED]: 0.8,
  [MORPH_TARGETS.MOUTH.A]: 0.7,
  [MORPH_TARGETS.MOUTH.I]: 0.5,
  [MORPH_TARGETS.MOUTH.U]: 0.4,
  [MORPH_TARGETS.MOUTH.E]: 0.6,
  [MORPH_TARGETS.MOUTH.O]: 0.6
};

// Emotion configurations
const EMOTIONS = {
  NEUTRAL: {
    brows: [],
    eyes: [],
    mouth: [],
    cheeks: []
  },
  HAPPY: {
    brows: [
      { target: BLENDSHAPES.BROWS.OUTER_UP_LEFT, value: 0.3 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_RIGHT, value: 0.3 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.SQUINT_LEFT, value: 0.2 },
      { target: BLENDSHAPES.EYES.SQUINT_RIGHT, value: 0.2 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.SMILE_LEFT, value: 0.7 },
      { target: BLENDSHAPES.MOUTH.SMILE_RIGHT, value: 0.7 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_LEFT, value: 0.4 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_RIGHT, value: 0.4 }
    ],
    cheeks: [
      { target: BLENDSHAPES.CHEEKS.SQUINT_LEFT, value: 0.3 },
      { target: BLENDSHAPES.CHEEKS.SQUINT_RIGHT, value: 0.3 }
    ]
  },
  THINKING: {
    brows: [
      { target: BLENDSHAPES.BROWS.INNER_UP, value: 0.5 },
      { target: BLENDSHAPES.BROWS.DOWN_LEFT, value: 0.2 },
      { target: BLENDSHAPES.BROWS.DOWN_RIGHT, value: 0.2 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.SQUINT_LEFT, value: 0.3 },
      { target: BLENDSHAPES.EYES.SQUINT_RIGHT, value: 0.3 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.PUCKER, value: 0.2 },
      { target: BLENDSHAPES.MOUTH.PRESS_LEFT, value: 0.3 },
      { target: BLENDSHAPES.MOUTH.PRESS_RIGHT, value: 0.3 }
    ],
    cheeks: []
  },
  LISTENING: {
    brows: [
      { target: BLENDSHAPES.BROWS.OUTER_UP_LEFT, value: 0.2 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_RIGHT, value: 0.2 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.WIDE_LEFT, value: 0.2 },
      { target: BLENDSHAPES.EYES.WIDE_RIGHT, value: 0.2 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.SMILE_LEFT, value: 0.2 },
      { target: BLENDSHAPES.MOUTH.SMILE_RIGHT, value: 0.2 }
    ],
    cheeks: []
  },
  // Add missing emotions
  SURPRISED: {
    brows: [
      { target: BLENDSHAPES.BROWS.INNER_UP, value: 0.7 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_LEFT, value: 0.7 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_RIGHT, value: 0.7 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.WIDE_LEFT, value: 0.7 },
      { target: BLENDSHAPES.EYES.WIDE_RIGHT, value: 0.7 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.OPEN, value: 0.4 },
      { target: BLENDSHAPES.MOUTH.FUNNEL, value: 0.3 }
    ],
    cheeks: []
  },
  JOY: {
    brows: [
      { target: BLENDSHAPES.BROWS.OUTER_UP_LEFT, value: 0.5 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_RIGHT, value: 0.5 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.SQUINT_LEFT, value: 0.5 },
      { target: BLENDSHAPES.EYES.SQUINT_RIGHT, value: 0.5 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.SMILE_LEFT, value: 0.8 },
      { target: BLENDSHAPES.MOUTH.SMILE_RIGHT, value: 0.8 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_LEFT, value: 0.6 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_RIGHT, value: 0.6 }
    ],
    cheeks: [
      { target: BLENDSHAPES.CHEEKS.SQUINT_LEFT, value: 0.5 },
      { target: BLENDSHAPES.CHEEKS.SQUINT_RIGHT, value: 0.5 }
    ]
  },
  FUN: {
    brows: [
      { target: BLENDSHAPES.BROWS.OUTER_UP_LEFT, value: 0.4 },
      { target: BLENDSHAPES.BROWS.OUTER_UP_RIGHT, value: 0.4 }
    ],
    eyes: [
      { target: BLENDSHAPES.EYES.SQUINT_LEFT, value: 0.3 },
      { target: BLENDSHAPES.EYES.SQUINT_RIGHT, value: 0.3 }
    ],
    mouth: [
      { target: BLENDSHAPES.MOUTH.SMILE_LEFT, value: 0.6 },
      { target: BLENDSHAPES.MOUTH.SMILE_RIGHT, value: 0.6 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_LEFT, value: 0.3 },
      { target: BLENDSHAPES.MOUTH.DIMPLE_RIGHT, value: 0.3 }
    ],
    cheeks: [
      { target: BLENDSHAPES.CHEEKS.SQUINT_LEFT, value: 0.3 },
      { target: BLENDSHAPES.CHEEKS.SQUINT_RIGHT, value: 0.3 }
    ]
  }
};

// Function to get morph target for a phoneme
const getMorphTarget = (phoneme: string): string => {
  // Convert to lowercase for consistent matching
  phoneme = phoneme.toLowerCase();
  
  // Map phonemes to mouth morph targets
  if ('aā'.includes(phoneme)) return MORPH_TARGETS.MOUTH.A;
  if ('iīy'.includes(phoneme)) return MORPH_TARGETS.MOUTH.I;
  if ('uūw'.includes(phoneme)) return MORPH_TARGETS.MOUTH.U;
  if ('eē'.includes(phoneme)) return MORPH_TARGETS.MOUTH.E;
  if ('oō'.includes(phoneme)) return MORPH_TARGETS.MOUTH.O;
  
  return MORPH_TARGETS.MOUTH.NEUTRAL;
};

// Function to apply emotion morphs
const applyEmotion = (model: THREE.Object3D, emotion: keyof typeof EMOTIONS, intensity: number = 0.5) => {
  if (!model) return;
  
  const emotionConfig = EMOTIONS[emotion];

  // Traverse the model to find meshes with morph targets
  model.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    // Process each category of morphs (brows, eyes, mouth, cheeks)
    ['brows', 'eyes', 'mouth', 'cheeks'].forEach((category) => {
      const morphs = emotionConfig[category as keyof typeof emotionConfig];
      if (Array.isArray(morphs)) {
        morphs.forEach(morph => {
          const morphIndex = node.morphTargetDictionary?.[morph.target];
          if (typeof morphIndex === 'number' && node.morphTargetInfluences) {
            node.morphTargetInfluences[morphIndex] = morph.value * intensity;
          }
        });
      }
    });
    
    // Special handling for smile/frown asymmetry
    if (emotion === 'JOY' || emotion === 'HAPPY') {
      const leftIndex = node.morphTargetDictionary?.['mouthSmileLeft'];
      const rightIndex = node.morphTargetDictionary?.['mouthSmileRight'];
      
      if (typeof leftIndex === 'number' && typeof rightIndex === 'number' && node.morphTargetInfluences) {
        // Add slight asymmetry to make smile more natural
        const asymmetry = 0.85 + Math.random() * 0.3; // 0.85-1.15
        const leftIntensity = 0.5 * intensity;
        const rightIntensity = 0.5 * intensity * asymmetry;
        
        node.morphTargetInfluences[leftIndex] = leftIntensity;
        node.morphTargetInfluences[rightIndex] = rightIntensity;
      }
    }
  });
};

// Improved eye blinking function that uses the actual model morphs
const handleEyeBlink = (model: THREE.Object3D) => {
  if (!model) return;
  
  const blinkDuration = 150; // milliseconds
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / blinkDuration);
    
    // Sine curve for smooth blink (0 -> 1 -> 0)
    const blinkValue = progress < 0.5 
      ? Math.sin(progress * Math.PI) 
      : Math.sin((1 - progress) * Math.PI);
    
    // Apply to all meshes with morph targets
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
      
      // Check and apply blink to both eyes
      const leftBlinkIndex = node.morphTargetDictionary?.['eyeBlinkLeft'];
      const rightBlinkIndex = node.morphTargetDictionary?.['eyeBlinkRight'];
      
      if (typeof leftBlinkIndex === 'number' && node.morphTargetInfluences) {
        node.morphTargetInfluences[leftBlinkIndex] = blinkValue;
      }
      
      if (typeof rightBlinkIndex === 'number' && node.morphTargetInfluences) {
        node.morphTargetInfluences[rightBlinkIndex] = blinkValue;
      }
      
      // Add slight squint during blink for realism
      const leftSquintIndex = node.morphTargetDictionary?.['eyeSquintLeft'];
      const rightSquintIndex = node.morphTargetDictionary?.['eyeSquintRight'];
      
      if (typeof leftSquintIndex === 'number' && node.morphTargetInfluences) {
        node.morphTargetInfluences[leftSquintIndex] = blinkValue * 0.3;
      }
      
      if (typeof rightSquintIndex === 'number' && node.morphTargetInfluences) {
        node.morphTargetInfluences[rightSquintIndex] = blinkValue * 0.3;
      }
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

// Function to start periodic blinking
const startBlinking = (model: THREE.Object3D) => {
  const minInterval = 4000;  // Minimum 4 seconds between blinks
  const maxInterval = 8000;  // Maximum 8 seconds between blinks
  
  const blink = () => {
    // Only blink 90% of the time to add more natural variation
    if (Math.random() < 0.9) {
      handleEyeBlink(model);
    }
    
    // Add extra randomization for more natural timing
    // Sometimes add an extra quick blink (10% chance)
    if (Math.random() < 0.1) {
      setTimeout(() => handleEyeBlink(model), 400);
    }
    
    // Schedule next blink with natural variation
    const baseInterval = minInterval + Math.random() * (maxInterval - minInterval);
    // Add some gaussian-like randomization
    const randomFactor = 1 + (Math.random() + Math.random() - 1) * 0.3;
    const nextBlink = baseInterval * randomFactor;
    
    setTimeout(() => {
      if (model) blink();
    }, nextBlink);
  };
  
  // Start the blinking loop with initial delay
  setTimeout(() => blink(), 2000); // Start blinking after 2 seconds
};

// Hair Controls
const HAIR_CONTROLS = {
  HIDE: 'Face.M_F00_000_00_Fcl_HA_Hide',
  FUNG1: {
    BASE: 'Face.M_F00_000_00_Fcl_HA_Fung1',
    LOW: 'Face.M_F00_000_00_Fcl_HA_Fung1_Low',
    UP: 'Face.M_F00_000_00_Fcl_HA_Fung1_Up'
  },
  FUNG2: {
    BASE: 'Face.M_F00_000_00_Fcl_HA_Fung2',
    LOW: 'Face.M_F00_000_00_Fcl_HA_Fung2_Low',
    UP: 'Face.M_F00_000_00_Fcl_HA_Fung2_Up'
  },
  FUNG3: {
    BASE: 'Face.M_F00_000_00_Fcl_HA_Fung3',
    LOW: 'Face.M_F00_000_00_Fcl_HA_Fung3_Low',
    UP: 'Face.M_F00_000_00_Fcl_HA_Fung3_Up'
  },
  SHORT: {
    BASE: 'Face.M_F00_000_00_Fcl_HA_Short',
    LOW: 'Face.M_F00_000_00_Fcl_HA_Short_Low',
    UP: 'Face.M_F00_000_00_Fcl_HA_Short_Up'
  }
};

// Extra Eye Features
const EYE_EXTRAS = {
  IRIS_HIDE: 'Face.M_F00_000_00_Fcl_EYE_Iris_Hide',
  HIGHLIGHT_HIDE: 'Face.M_F00_000_00_Fcl_EYE_Highlight_Hide',
  EXTRA: 'Face.M_F00_000_00_Fcl_EYE_Extra',
  EXTRA_ON: 'EyeExtra_01.M_F00_000_00_EyeExtra_On'
};

// Mouth Skin Controls
const MOUTH_SKIN = {
  FUNG: 'Face.M_F00_000_00_Fcl_MTH_SkinFung',
  FUNG_R: 'Face.M_F00_000_00_Fcl_MTH_SkinFung_R',
  FUNG_L: 'Face.M_F00_000_00_Fcl_MTH_SkinFung_L'
};

// Personality trait types
interface PersonalityTraits {
  expressiveness: number; // 0-1: how expressive the avatar is
  emotionality: number;   // 0-1: how emotional the avatar is
  reactivity: number;     // 0-1: how quickly the avatar reacts
  positivity: number;     // 0-1: tendency towards positive expressions
}

// Default personality
const DEFAULT_PERSONALITY: PersonalityTraits = {
  expressiveness: 0.7,
  emotionality: 0.6,
  reactivity: 0.8,
  positivity: 0.7
};

// Micro-expression definitions
interface MicroExpression {
  emotion: string;
  duration: number;
  intensity: number;
  target: keyof typeof MORPH_TARGETS;
}

// Animation state interface
interface AnimationState {
  current: string;
  weight: number;
  transitionDuration: number;
}

// Store animations
interface AnimationMap {
  [key: string]: THREE.AnimationClip;
}

// Enhanced Hair Physics System for more natural movement
const HairPhysics = {
  moveWithHead: (node: THREE.Mesh, intensity: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const morphInfluences = node.morphTargetInfluences;
    
    // Create wave-like motion using different hair parts
    const animate = () => {
      const time = Date.now() * 0.001; // Convert to seconds
      
      // Add slight randomization to frequencies for less mechanical movement
      const randomOffset1 = Math.sin(time * 0.3) * 0.1;
      const randomOffset2 = Math.cos(time * 0.2) * 0.1;
      
      // Animate FUNG1
      const fung1Base = morphDict[HAIR_CONTROLS.FUNG1.BASE];
      const fung1Up = morphDict[HAIR_CONTROLS.FUNG1.UP];
      const fung1Low = morphDict[HAIR_CONTROLS.FUNG1.LOW];
      
      if (typeof fung1Base === 'number' && typeof fung1Up === 'number' && typeof fung1Low === 'number') {
        morphInfluences[fung1Base] = Math.sin(time + randomOffset1) * intensity;
        morphInfluences[fung1Up] = Math.sin(time + 0.2 + randomOffset2) * intensity;
        morphInfluences[fung1Low] = Math.sin(time + 0.4 + randomOffset1) * intensity;
      }
      
      // Animate FUNG2 with slight delay
      const fung2Base = morphDict[HAIR_CONTROLS.FUNG2.BASE];
      const fung2Up = morphDict[HAIR_CONTROLS.FUNG2.UP];
      const fung2Low = morphDict[HAIR_CONTROLS.FUNG2.LOW];
      
      if (typeof fung2Base === 'number' && typeof fung2Up === 'number' && typeof fung2Low === 'number') {
        morphInfluences[fung2Base] = Math.sin(time + 0.1 + randomOffset2) * intensity;
        morphInfluences[fung2Up] = Math.sin(time + 0.3 + randomOffset1) * intensity;
        morphInfluences[fung2Low] = Math.sin(time + 0.5 + randomOffset2) * intensity;
      }
      
      // Add subtle head movement for more liveliness
      const browInnerUp = morphDict[BLENDSHAPES.BROWS.INNER_UP];
      if (typeof browInnerUp === 'number') {
        morphInfluences[browInnerUp] = Math.sin(time * 0.2) * 0.05; // Very subtle
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  },
  
  windEffect: (node: THREE.Mesh, direction: THREE.Vector3, strength: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const morphInfluences = node.morphTargetInfluences;
    
    // Calculate wind influence based on direction
    const windAngle = Math.atan2(direction.x, direction.z);
    
    const animate = () => {
      const time = Date.now() * 0.001;
      const windIntensity = Math.sin(time * 2) * strength;
      
      // Apply wind effect to all hair parts
      Object.values(HAIR_CONTROLS).forEach(control => {
        if (typeof control === 'object') {
          const baseIndex = morphDict[control.BASE];
          const upIndex = morphDict[control.UP];
          const lowIndex = morphDict[control.LOW];
          
          if (typeof baseIndex === 'number' && typeof upIndex === 'number' && typeof lowIndex === 'number') {
            morphInfluences[baseIndex] = Math.cos(windAngle) * windIntensity;
            morphInfluences[upIndex] = Math.sin(windAngle + time) * windIntensity;
            morphInfluences[lowIndex] = Math.cos(windAngle + time) * windIntensity;
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
};

// Enhanced Eye System
const EyeSystem = {
  setPupilSize: (node: THREE.Mesh, size: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const irisIndex = morphDict[EYE_EXTRAS.IRIS_HIDE];
    
    if (typeof irisIndex === 'number') {
      const targetSize = 1 - Math.max(0, Math.min(1, size));
      node.morphTargetInfluences[irisIndex] = targetSize;
    }
  },
  
  setEyeHighlight: (node: THREE.Mesh, intensity: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const highlightIndex = morphDict[EYE_EXTRAS.HIGHLIGHT_HIDE];
    
    if (typeof highlightIndex === 'number') {
      const targetIntensity = 1 - Math.max(0, Math.min(1, intensity));
      node.morphTargetInfluences[highlightIndex] = targetIntensity;
    }
  },
  
  specialEffect: (node: THREE.Mesh) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const extraIndex = morphDict[EYE_EXTRAS.EXTRA];
    const extraOnIndex = morphDict[EYE_EXTRAS.EXTRA_ON];
    
    if (typeof extraIndex === 'number' && typeof extraOnIndex === 'number') {
      const animate = () => {
        const time = Date.now() * 0.001;
        const intensity = (Math.sin(time * 2) + 1) / 2;
        
        // The error is here - add a check
        if (node.morphTargetInfluences) {
        node.morphTargetInfluences[extraIndex] = intensity;
        node.morphTargetInfluences[extraOnIndex] = intensity;
        }
      };
      
      animate();
    }
  }
};

// Facial Muscle System
const FacialMuscles = {
  smile: (node: THREE.Mesh, intensity: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
        const morphDict = node.morphTargetDictionary;
        const morphInfluences = node.morphTargetInfluences;
        
    // Combine multiple morphs for natural smile
    const targets = {
      skinFung: morphDict[MOUTH_SKIN.FUNG],
      skinFungR: morphDict[MOUTH_SKIN.FUNG_R],
      skinFungL: morphDict[MOUTH_SKIN.FUNG_L],
      mouthJoy: morphDict[MORPH_TARGETS.MOUTH.JOY],
      eyeJoy: morphDict[MORPH_TARGETS.EYE.JOY]
    };
    
    Object.entries(targets).forEach(([_, index]) => {
            if (typeof index === 'number') {
        morphInfluences[index] = intensity;
      }
    });
  },
  
  asymmetricExpression: (node: THREE.Mesh, leftIntensity: number, rightIntensity: number) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    const morphDict = node.morphTargetDictionary;
    const morphInfluences = node.morphTargetInfluences;
    
    // Apply asymmetric morphs
    const leftIndex = morphDict[MOUTH_SKIN.FUNG_L];
    const rightIndex = morphDict[MOUTH_SKIN.FUNG_R];
    
    if (typeof leftIndex === 'number' && typeof rightIndex === 'number') {
      morphInfluences[leftIndex] = leftIntensity;
      morphInfluences[rightIndex] = rightIntensity;
    }
  }
};

// Micro-Expression System
const MicroExpressionSystem = {
  currentMicroExpressions: new Set<MicroExpression>(),
  
  addMicroExpression: (node: THREE.Mesh, emotion: keyof typeof EMOTIONS, duration: number = 1000, intensity: number = 0.7) => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) return;
      
      const progress = elapsed / duration;
      
      // Apply micro-expression with natural easing - more gradual start and finish
      const easeProgress = progress < 0.3 
        ? progress * 3.33 * 0.5 // Gradual start (0-30%)
        : progress > 0.7 
          ? (1 - (progress - 0.7) * 3.33) * 0.5 // Gradual end (70-100%)
          : 0.5; // Hold at full intensity (30-70%)
          
      applyEmotion(node, emotion, intensity * easeProgress);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  },
  
  layerExpressions: (node: THREE.Mesh, baseEmotion: keyof typeof EMOTIONS, microEmotions: (keyof typeof EMOTIONS)[]) => {
    // Apply base emotion
    applyEmotion(node, baseEmotion);
    
    // Layer micro-expressions with more natural timing
    microEmotions.forEach((emotion, index) => {
                setTimeout(() => {
        // Randomize duration slightly for less mechanical feel
        const randomDuration = 800 + Math.random() * 400;
        MicroExpressionSystem.addMicroExpression(node, emotion, randomDuration, 0.4);
      }, index * 1500 + Math.random() * 300); // Add slight randomization to timing
    });
    
    // Occasionally add an unexpected micro-expression for liveliness
    if (Math.random() < 0.3) { // 30% chance
      setTimeout(() => {
        const randomEmotions: (keyof typeof EMOTIONS)[] = ['SURPRISED', 'JOY', 'FUN'];
        const randomEmotion = randomEmotions[Math.floor(Math.random() * randomEmotions.length)];
        MicroExpressionSystem.addMicroExpression(node, randomEmotion, 500, 0.2);
      }, microEmotions.length * 1500 + 1000 + Math.random() * 1000);
    }
  }
};

// Environmental Response System
const EnvironmentalSystem = {
  respondToMovement: (node: THREE.Mesh, velocity: THREE.Vector3) => {
    const speed = velocity.length();
    
    // Hair physics response
    HairPhysics.windEffect(node, velocity.normalize(), speed * 0.1);
    
    // Expression response based on movement
    if (speed > 1) {
      MicroExpressionSystem.addMicroExpression(node, 'SURPRISED', 300, speed * 0.1);
    }
  },
  
  adaptToLighting: (node: THREE.Mesh, intensity: number) => {
    // Adjust eye features based on light
    const pupilSize = Math.max(0.2, Math.min(0.8, 1 - intensity));
    const highlightIntensity = Math.max(0.3, Math.min(1, intensity));
    
    EyeSystem.setPupilSize(node, pupilSize);
    EyeSystem.setEyeHighlight(node, highlightIntensity);
  }
};

// Personality System
const PersonalitySystem = {
  currentPersonality: { ...DEFAULT_PERSONALITY },
  
  setPersonalityBase: (traits: PersonalityTraits) => {
    PersonalitySystem.currentPersonality = traits;
  },
  
  expressPersonality: (node: THREE.Mesh, situation: string) => {
    const { expressiveness, emotionality, reactivity, positivity } = PersonalitySystem.currentPersonality;
    
    // Adjust expression intensity based on personality
    const getIntensity = (baseIntensity: number) => {
      return baseIntensity * expressiveness * (positivity > 0.5 ? 1.2 : 0.8);
    };
    
    // Apply personality-based expressions
    switch (situation) {
      case 'greeting':
        FacialMuscles.smile(node, getIntensity(0.7));
        if (expressiveness > 0.6) {
          MicroExpressionSystem.addMicroExpression(node, 'JOY', 500, getIntensity(0.5));
        }
        break;
      case 'thinking':
        const thinkingIntensity = getIntensity(0.4) * emotionality;
        applyEmotion(node, 'THINKING', thinkingIntensity);
        if (reactivity > 0.7) {
          MicroExpressionSystem.addMicroExpression(node, 'SURPRISED', 200, thinkingIntensity);
        }
        break;
      // Add more situations as needed
    }
  }
};

// Advanced Animation Blending System
const AnimationBlending = {
  currentAnimations: new Map<string, AnimationState>(),
  
  // Fix type error with animation clips
  blendAnimations: (mixer: THREE.AnimationMixer, animNames: string[], weights: number[]) => {
    // Normalize weights
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Apply all animations with weights
    animNames.forEach((animName, index) => {
      // Get the actual animation clip by name instead of using string directly
      const animClips = (mixer as any)._actions?.map((action: any) => action._clip) || [];
      const clip = animClips.find((c: THREE.AnimationClip) => c.name === animName);
      
      if (clip) {
        const action = mixer.clipAction(clip);
      action.setEffectiveWeight(normalizedWeights[index]);
      action.play();
      
        AnimationBlending.currentAnimations.set(animName, {
          current: animName,
        weight: normalizedWeights[index],
        transitionDuration: 0.5
      });
      } else {
        console.warn(`Animation '${animName}' not found`);
      }
    });
  },
  
  selectContextualAnim: (mixer: THREE.AnimationMixer, context: string) => {
    // Select appropriate animations based on context
    switch (context) {
      case 'greeting':
        return AnimationBlending.blendAnimations(
          mixer,
          ['idle2', 'talking1'],
          [0.3, 0.7]
        );
      case 'explaining':
        return AnimationBlending.blendAnimations(
          mixer,
          ['talking2_head_shake', 'idle3_hand_hips'],
          [0.6, 0.4]
        );
      // Add more contextual animations
    }
  }
};

interface ExtendedAnimationMixer extends THREE.AnimationMixer {
  _actions: Map<THREE.AnimationClip, THREE.AnimationAction>;
}

// Function to completely reset mouth to closed position
const resetMouth = (model: THREE.Object3D) => {
  if (!model) return;

  model.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    
    // Reset all viseme morphs
    Object.values(VISEME_MAP).forEach(v => {
      const idx = node.morphTargetDictionary?.[v.viseme];
      if (typeof idx === 'number' && node.morphTargetInfluences) {
        // Immediately set to zero (no lerp for closing)
        node.morphTargetInfluences[idx] = 0;
      }
    });
    
    // Close jaw completely
    const jawOpenIndex = node.morphTargetDictionary?.['jawOpen'];
    if (typeof jawOpenIndex === 'number' && node.morphTargetInfluences) {
      node.morphTargetInfluences[jawOpenIndex] = 0;
    }
    
    // Reset any mouth pucker or smile shapes
    const puckerIndex = node.morphTargetDictionary?.['mouthPucker'];
    if (typeof puckerIndex === 'number' && node.morphTargetInfluences) {
      node.morphTargetInfluences[puckerIndex] = 0;
    }
    
    const smileLeftIndex = node.morphTargetDictionary?.['mouthSmileLeft'];
    const smileRightIndex = node.morphTargetDictionary?.['mouthSmileRight'];
    if (typeof smileLeftIndex === 'number' && node.morphTargetInfluences) {
      node.morphTargetInfluences[smileLeftIndex] = 0;
    }
    if (typeof smileRightIndex === 'number' && node.morphTargetInfluences) {
      node.morphTargetInfluences[smileRightIndex] = 0;
    }
    
    // Reset tongue
    const tongueOutIndex = node.morphTargetDictionary?.['tongueOut'];
    if (typeof tongueOutIndex === 'number' && node.morphTargetInfluences) {
      node.morphTargetInfluences[tongueOutIndex] = 0;
    }
  });
};

// Add new interpolation utility
const lerpMorphTargets = (
  node: THREE.Mesh,
  fromViseme: typeof VISEME_MAP[keyof typeof VISEME_MAP],
  toViseme: typeof VISEME_MAP[keyof typeof VISEME_MAP],
  progress: number
) => {
  if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;

  // Use smooth step function for more natural easing
  const smoothProgress = progress * progress * (3 - 2 * progress);

  // Interpolate between viseme values with reduced intensity
  const fromIdx = node.morphTargetDictionary[fromViseme.viseme];
  const toIdx = node.morphTargetDictionary[toViseme.viseme];
  
  if (typeof fromIdx === 'number' && typeof toIdx === 'number' && node.morphTargetInfluences) {
    // Add damping factor to reduce overall intensity
    const dampingFactor = 0.8;
    node.morphTargetInfluences[fromIdx] = (fromViseme.value * (1 - smoothProgress)) * dampingFactor;
    node.morphTargetInfluences[toIdx] = (toViseme.value * smoothProgress) * dampingFactor;
  }

  // Interpolate jaw movement with reduced range
  const jawOpenIndex = node.morphTargetDictionary['jawOpen'];
  if (typeof jawOpenIndex === 'number' && node.morphTargetInfluences) {
    const fromJaw = fromViseme.jaw;
    const toJaw = toViseme.jaw;
    // Add jaw damping factor
    const jawDampingFactor = 0.7;
    node.morphTargetInfluences[jawOpenIndex] = THREE.MathUtils.lerp(fromJaw, toJaw, smoothProgress) * jawDampingFactor;
  }
};

// Enhanced processWord function with smooth transitions
  const processWord = (word: string, model: THREE.Object3D) => {
    if (!model) return;

  // Special case for silence - smoothly transition to closed mouth
    if (word === 'sil' || word === '' || word === '.') {
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;

      // Store current values for smooth transition
      const currentValues = new Map<number, number>();
      Object.values(VISEME_MAP).forEach(v => {
        const idx = node.morphTargetDictionary?.[v.viseme];
        if (typeof idx === 'number' && node.morphTargetInfluences) {
          currentValues.set(idx, node.morphTargetInfluences[idx]);
        }
      });

      // Animate to closed position with longer duration for more natural closing
      const startTime = Date.now();
      const duration = 200; // Increased duration for smoother closing

      const animateClose = () => {
        if (!node.morphTargetInfluences) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Use cubic easing for smoother closing
        const smoothProgress = progress * progress * (3 - 2 * progress);

        // Gradually reduce all morph target values with extra smoothing
        currentValues.forEach((startValue, idx) => {
          if (node.morphTargetInfluences) {
            node.morphTargetInfluences[idx] = startValue * (1 - smoothProgress) * 0.9; // Added dampening factor
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animateClose);
        }
      };

      animateClose();
    });
    return;
  }

  // Enhanced dominant phoneme detection with coarticulation
  const getDominantPhoneme = (word: string): { current: string; next?: string } => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    if (!cleanWord) return { current: 'sil' };

    // Get current and next phonemes for coarticulation
    const phonemes = Array.from(cleanWord).map(char => CHAR_TO_PHONEME_MAP[char] || 'sil');
    return {
      current: phonemes[0],
      next: phonemes[1]
    };
  };

  const { current, next } = getDominantPhoneme(word);
  const currentViseme = VISEME_MAP[current as keyof typeof VISEME_MAP] || VISEME_MAP['sil'];
  const nextViseme = next ? (VISEME_MAP[next as keyof typeof VISEME_MAP] || VISEME_MAP['sil']) : VISEME_MAP['sil'];

    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
      
    // Animate transition between visemes with longer duration
    const startTime = Date.now();
    const duration = 120; // Slightly increased for smoother transitions

    const animateViseme = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Interpolate between current and next viseme
      lerpMorphTargets(node, currentViseme, nextViseme, progress);

      // Add very subtle anticipatory coarticulation
      if (next && progress > 0.7 && node.morphTargetInfluences) {
        const coarticulationStrength = (progress - 0.7) / 0.3 * 0.15; // Reduced from 0.3 to 0.15
        Object.entries(VISEME_MAP).forEach(([phoneme, viseme]) => {
          const idx = node.morphTargetDictionary?.[viseme.viseme];
          if (typeof idx === 'number' && node.morphTargetInfluences && phoneme === next) {
            node.morphTargetInfluences[idx] += viseme.value * coarticulationStrength;
          }
        });
      }

      if (progress < 1) {
        requestAnimationFrame(animateViseme);
      }
    };

    animateViseme();
  });
};

const RPMAvatar: React.FC<RPMAvatarProps> = ({ avatarUrl, currentState, isSpeaking = false, speechText = '', speechEvents = [], selectedEnvironment = '/environments/therapy_room_env.hdr' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const morphTargetsRef = useRef<{ [key: string]: number }>({});
  const currentAnimationRef = useRef<THREE.AnimationAction | null>(null);
  const animationsRef = useRef<{ [key: string]: THREE.AnimationClip }>({});

  // Add new refs for advanced features
  const personalityRef = useRef<PersonalityTraits>(DEFAULT_PERSONALITY);
  const lastVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const environmentalSystemRef = useRef<NodeJS.Timeout | null>(null);

  // Function to safely handle morph targets
  const handleMorphTargets = (node: THREE.Mesh, callback: (morphDict: { [key: string]: number }, morphInfluences: number[]) => void) => {
    if (!node.morphTargetDictionary || !node.morphTargetInfluences) return;
    callback(node.morphTargetDictionary, node.morphTargetInfluences);
  };

  // Function to get available animations
  const getAvailableAnimations = (): string[] => {
    return Object.keys(animationsRef.current);
  };

  // Function to safely get animation clip
  const getAnimationClip = (name: string): THREE.AnimationClip | null => {
    if (!animationsRef.current) return null;
    return animationsRef.current[name.toLowerCase()] || null;
  };

  // Function to smoothly transition between animations
  const fadeToAction = (actionName: string, duration: number = 0.5) => {
    const previousAction = currentAnimationRef.current;
    const clip = getAnimationClip(actionName);

    if (!clip || !mixerRef.current) {
      console.warn(`Animation not found: ${actionName}`);
      return;
    }

    const newAction = mixerRef.current.clipAction(clip);

    // Reset and configure new action
      newAction.reset();
      newAction.setEffectiveTimeScale(1);
      newAction.setEffectiveWeight(1);
    newAction.clampWhenFinished = true;
      newAction.setLoop(THREE.LoopRepeat, Infinity);

    if (previousAction && previousAction !== newAction) {
      // Fade out previous action
      previousAction.fadeOut(duration);

      // Start new action
      newAction.fadeIn(duration);
      newAction.play();

      currentAnimationRef.current = newAction;
      console.log(`Transitioning from previous animation to: ${actionName}`);
    } else {
      // Just play the new action if no previous action exists
      newAction.play();
      currentAnimationRef.current = newAction;
      console.log(`Starting animation: ${actionName}`);
    }
  };

  // Function to shuffle talking animations
  const shuffleTalkingAnimations = () => {
    const shuffled = [...TALKING_ANIMATIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled[0];
  };

  // Get next talking animation in sequence
  const getNextTalkingAnimation = () => {
    const nextAnim = shuffleTalkingAnimations();
    fadeToAction(nextAnim, 0.5);
    return nextAnim.toLowerCase();
  };

  // Handle speech events and lip-sync with improved response timing
  useEffect(() => {
    if (!isSpeaking || !modelRef.current) {
      // Reset to silent viseme when not speaking
      if (modelRef.current) {
        resetMouth(modelRef.current);
      }
      return;
    }

    let animationFrameId: number;

    // Function to analyze a word and determine its speaking duration
    const getWordDuration = (word: string): number => {
      // Clean the word of punctuation
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      
      // Base timings
      const baseSpeed = 80; // Milliseconds per syllable
      
      // Check for punctuation pauses
      const hasPause = /[.,!?;:]$/.test(word);
      
      // Estimate syllables (rough approximation)
      const vowelCount = (word.match(/[aeiouy]+/gi) || []).length;
      const syllables = Math.max(1, vowelCount);
      
      // Calculate duration factors
      let duration = baseSpeed * syllables;
      
      // Adjust for word length
      if (cleanWord.length <= 2) duration *= 0.8; // Shorter for small words
      if (cleanWord.length >= 8) duration *= 1.2; // Longer for big words
      
      // Add pause time for punctuation
      if (hasPause) {
        if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
          duration += 150; // Longer pause at end of sentences
        } else if (word.endsWith(',') || word.endsWith(';') || word.endsWith(':')) {
          duration += 80; // Medium pause at clauses
        }
      }
      
      return Math.min(300, Math.max(60, duration)); // Clamp between 60-300ms
    };

    if (speechEvents && speechEvents.length > 0) {
      let currentEventIndex = 0;
      let lastEventTime = Date.now();
      
      // Check if this is likely from Gemini (based on speechEvents format from gemini.ts)
      const isGeminiResponse = speechEvents.some(event => 
        event.type === 'boundary' && typeof event.value === 'string' && event.value.length > 0
      );

      const processSpeechEvents = () => {
        const currentTime = Date.now();
        const event = speechEvents[currentEventIndex];
        
        if (event) {
          const timeSinceLastEvent = currentTime - lastEventTime;
          
          if (event.type === 'boundary' && event.value) {
            // For Gemini responses, use word-aware timing
            const wordDuration = isGeminiResponse ? getWordDuration(event.value) : 80;
            
            if (timeSinceLastEvent >= wordDuration) {
              processWord(event.value, modelRef.current!);
              lastEventTime = currentTime;
              currentEventIndex++;
            }
          } else if (event.type === 'end') {
            // Immediately close mouth
            resetMouth(modelRef.current!);
            currentEventIndex++;
          }
        }

        if (currentEventIndex < speechEvents.length) {
          animationFrameId = requestAnimationFrame(processSpeechEvents);
        } else {
          // Make sure mouth is closed at the end
          resetMouth(modelRef.current!);
        }
      };

      processSpeechEvents();
    } else if (speechText) {
      // For direct text processing (Gemini text response without speech events)
      
      // First process the text to better match natural speech patterns
      const processTextForSpeech = (text: string): string[] => {
        // Remove excess whitespace
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        // Split on sentence boundaries with punctuation
        const sentenceSplitter = /([.!?]+(?:\s|$))/;
        const sentences = cleanText.split(sentenceSplitter).filter(s => s.trim());
        
        // Process each sentence into phrases
        const phrases: string[] = [];
        
        sentences.forEach(part => {
          // If it's punctuation, attach to previous phrase
          if (/^[.!?]+$/.test(part)) {
            if (phrases.length > 0) {
              phrases[phrases.length - 1] += part;
            }
            return;
          }
          
          // Split on natural phrase boundaries
          const phraseSplitter = /([,;:]|(?:\s+(?:and|but|or|so|because|however|therefore|moreover|furthermore|consequently|meanwhile)\s+))/i;
          const sentencePhrases = part.split(phraseSplitter).filter(p => p.trim());
          
          sentencePhrases.forEach(phrase => {
            if (/^[,;:]|(?:and|but|or|so|because|however|therefore|moreover|furthermore|consequently|meanwhile)$/i.test(phrase)) {
              // If it's a connector, attach to previous phrase
              if (phrases.length > 0) {
                phrases[phrases.length - 1] += ' ' + phrase;
              }
            } else {
              // Otherwise it's a new phrase
              phrases.push(phrase.trim());
            }
          });
        });
        
        // Now get all individual words
        return phrases.flatMap(phrase => {
          // Split the phrase into words, preserving punctuation with the words
          const wordPattern = /\b[\w']+\b|[.,!?;:]/g;
          const matches = phrase.match(wordPattern) || [];
          
          // Combine punctuation with the preceding word
          const words: string[] = [];
          let currentWord = '';
          
          matches.forEach(match => {
            if (/[.,!?;:]/.test(match)) {
              // If it's punctuation, add to current word
              currentWord += match;
            } else {
              // If we have a stored word, add it to results
              if (currentWord) {
                words.push(currentWord);
              }
              // Start a new word
              currentWord = match;
            }
          });
          
          // Add the last word
          if (currentWord) {
            words.push(currentWord);
          }
          
          return words;
        });
      };
      
      // Process text into speech-friendly word sequences
      const words = processTextForSpeech(speechText);
      
      let currentIndex = 0;
      let lastWordTime = Date.now();
      
      const processWords = () => {
        const currentTime = Date.now();
        
        if (currentIndex < words.length) {
          const word = words[currentIndex];
          const wordDuration = getWordDuration(word);
          
          if (currentTime - lastWordTime >= wordDuration) {
            processWord(word, modelRef.current!);
            lastWordTime = currentTime;
            currentIndex++;
          }
        }

        if (currentIndex < words.length) {
          animationFrameId = requestAnimationFrame(processWords);
        } else {
          // Immediately close mouth at the end
          resetMouth(modelRef.current!);
        }
      };

      processWords();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Reset to silent viseme
      if (modelRef.current) {
        processWord('sil', modelRef.current);
      }
    };
  }, [isSpeaking, speechText, speechEvents]);

  // Initialize personality and environmental systems
  useEffect(() => {
    if (!modelRef.current) return;

    // Set initial personality
    PersonalitySystem.setPersonalityBase(personalityRef.current);

    // Start blinking immediately
    startBlinking(modelRef.current);

    // Initialize random micro-expressions on a timer for idle moments
    const idleMicroExpressionInterval = setInterval(() => {
      if (!isSpeaking && currentState === 'idle') {
        modelRef.current?.traverse((node) => {
          if (node instanceof THREE.Mesh && node.morphTargetDictionary && node.morphTargetInfluences) {
            // Choose a random micro-expression
            const expressions: (keyof typeof EMOTIONS)[] = ['HAPPY', 'SURPRISED', 'FUN', 'JOY'];
            const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
            
            // Apply with very subtle intensity
            MicroExpressionSystem.addMicroExpression(node, randomExpression, 600, 0.15);
          }
        });
      }
    }, 8000 + Math.random() * 5000); // Random interval between 8-13 seconds

    // Start environmental updates with enhanced movement
    const updateEnvironment = () => {
      modelRef.current?.traverse((node) => {
        if (node instanceof THREE.Mesh && node.morphTargetDictionary && node.morphTargetInfluences) {
          // Simulate more dynamic and natural movement
          const time = Date.now() * 0.001;
          
          // Add micro-movements to simulate breathing
          const breathCycle = Math.sin(time * 0.3) * 0.05; // Slow breathing cycle
          
          // Apply subtle head movements
          const headTiltCycle = Math.sin(time * 0.1) * 0.02; // Very subtle head tilt
          
          // Apply to appropriate morphs if available
          if (node.morphTargetDictionary && node.morphTargetInfluences) {
            if (node.morphTargetDictionary['jawOpen'] !== undefined) {
              const jawOpenIdx = node.morphTargetDictionary['jawOpen'];
              // Add *very* subtle jaw movement for breathing
              node.morphTargetInfluences[jawOpenIdx] = Math.max(0, breathCycle * 0.2);
            }
            
            // Apply subtle eye movements
            if (node.morphTargetDictionary['eyeLookUpLeft'] !== undefined && 
                node.morphTargetDictionary['eyeLookUpRight'] !== undefined) {
              const eyeUpLeftIdx = node.morphTargetDictionary['eyeLookUpLeft'];
              const eyeUpRightIdx = node.morphTargetDictionary['eyeLookUpRight'];
              
              // Subtle occasional eye movement
              if (Math.random() < 0.02) { // 2% chance per frame
                node.morphTargetInfluences[eyeUpLeftIdx] = (Math.random() - 0.5) * 0.1;
                node.morphTargetInfluences[eyeUpRightIdx] = (Math.random() - 0.5) * 0.1;
              }
            }
          }
          
          // Simulate basic physics
          const velocity = new THREE.Vector3(
            Math.sin(time * 0.5) * 0.1 + headTiltCycle,
            Math.cos(time * 0.3) * 0.05 + breathCycle,
            Math.sin(time * 0.4) * 0.1
          );
          
          // Apply hair physics with slightly increased intensity
          HairPhysics.moveWithHead(node, 0.35);
      }
    });
  };

    environmentalSystemRef.current = setInterval(updateEnvironment, 1000 / 30); // 30fps updates

    return () => {
      if (environmentalSystemRef.current) {
        clearInterval(environmentalSystemRef.current);
      }
      if (idleMicroExpressionInterval) {
        clearInterval(idleMicroExpressionInterval);
      }
    };
  }, [currentState, isSpeaking]);

  // Enhanced state change handling
  useEffect(() => {
    if (!mixerRef.current || !modelRef.current) return;

    const targetState = currentState.toLowerCase();
    console.log('Avatar state changed to:', targetState);
    
    modelRef.current.traverse((node) => {
      if (node instanceof THREE.Mesh && node.morphTargetDictionary && node.morphTargetInfluences) {
        // Apply personality-based response to state change
        PersonalitySystem.expressPersonality(node, targetState);
        
        // Add micro-expressions based on state
        switch(targetState) {
          case 'speaking':
            MicroExpressionSystem.layerExpressions(node, 'HAPPY', ['JOY', 'SURPRISED']);
            break;
          case 'listening':
            MicroExpressionSystem.layerExpressions(node, 'NEUTRAL', ['SURPRISED', 'FUN']);
            break;
          case 'thinking':
            MicroExpressionSystem.layerExpressions(node, 'THINKING', ['SURPRISED']);
            break;
        }
        
        // Apply facial muscle control
        if (targetState === 'speaking') {
          FacialMuscles.smile(node, 0.3);
        }
      }
    });

    // Use advanced animation blending
    AnimationBlending.selectContextualAnim(mixerRef.current, targetState);
  }, [currentState]);

  // Update animation and emotions when state changes
  useEffect(() => {
    if (!mixerRef.current || !modelRef.current) return;

    const targetState = currentState.toLowerCase();
    console.log('Avatar state changed to:', targetState);
    
    // Map states to specific built-in animations and emotions
    const stateToAnimation: Record<string, string> = {
      'idle': 'idle1',
      'speaking': 'talking1',
      'listening': 'idle2',
      'thinking': 'idle3_hand_hips'
    };

    // Apply appropriate emotion for the state
    if (modelRef.current) {
        switch(targetState) {
          case 'idle':
          applyEmotion(modelRef.current, 'NEUTRAL');
            break;
          case 'speaking':
          applyEmotion(modelRef.current, 'HAPPY');
            break;
          case 'listening':
          applyEmotion(modelRef.current, 'LISTENING');
            break;
          case 'thinking':
          applyEmotion(modelRef.current, 'THINKING');
            break;
          default:
          applyEmotion(modelRef.current, 'NEUTRAL');
        }
      }

    // Apply corresponding animation
    const animationName = stateToAnimation[targetState];
    if (!animationName) {
      console.log('Unknown state, defaulting to idle1');
      fadeToAction('idle1', 0.5);
      return;
    }

    // Check if we have the animation in our clips
    const animClip = getAnimationClip(animationName);
    
    if (animClip && mixerRef.current) {
      console.log(`Playing animation for state ${targetState}: ${animationName}`);
      // Get the action
      const action = mixerRef.current.clipAction(animClip);
      
      // Fade between animations
      if (currentAnimationRef.current && currentAnimationRef.current !== action) {
        // Fade out previous action
        currentAnimationRef.current.fadeOut(0.5);
        
        // Fade in new action
        action.reset();
        action.fadeIn(0.5);
        action.play();
        
        currentAnimationRef.current = action;
      } else if (!currentAnimationRef.current) {
        // First animation, just play
        action.play();
        currentAnimationRef.current = action;
      }
    } else {
      console.warn(`Animation ${animationName} not found, defaulting to first available`);
      const availableAnims = Object.keys(animationsRef.current);
      if (availableAnims.length > 0) {
        const firstClip = animationsRef.current[availableAnims[0]];
        if (firstClip && mixerRef.current) {
          const action = mixerRef.current.clipAction(firstClip);
          action.play();
          currentAnimationRef.current = action;
        }
      }
    }
  }, [currentState]);

  // Add effect to cycle through talking animations while speaking
  useEffect(() => {
    if (currentState !== 'speaking') return;
    
    const cycleInterval = setInterval(() => {
      if (currentState === 'speaking') {
        const nextAnim = getNextTalkingAnimation();
        fadeToAction(nextAnim, 0.5);
      }
    }, 5000); // Switch every 5 seconds while speaking

    return () => clearInterval(cycleInterval);
  }, [currentState]);

  // Initialize animations
  const loadAllAnimations = async () => {
    if (mixerRef.current && animationsRef.current) {
      console.log('Initializing animations');
      
      // Get all available animation names
      const availableAnims = Object.keys(animationsRef.current);
      console.log('Available animations:', availableAnims);
      
      // Start with idle1 animation if available
      if (availableAnims.includes('idle1')) {
        console.log('Starting with idle1 animation');
        const idleClip = animationsRef.current['idle1'];
        if (idleClip) {
          const action = mixerRef.current.clipAction(idleClip);
          action.play();
          currentAnimationRef.current = action;
        }
      } else if (availableAnims.length > 0) {
        // Fall back to the first available animation
        console.log(`Starting with ${availableAnims[0]} animation`);
        const firstClip = animationsRef.current[availableAnims[0]];
        if (firstClip) {
          const action = mixerRef.current.clipAction(firstClip);
          action.play();
          currentAnimationRef.current = action;
        }
      } else {
        console.warn('No animations available');
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene with light color scheme
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); // Light background
    sceneRef.current = scene;
    
    // Initialize renderer with enhanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; // Increased exposure for brighter environment
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create professional modern office environment
    const createModernOffice = () => {
      // Colors for modern light office
      const accentColor1 = 0x4d8c6f; // Dark teal
      const accentColor2 = 0xd4c0a8; // Warm beige
      const accentColor3 = 0xf8f8f8; // Almost white
      const lightWoodColor = 0xe0c9ad; // Light wood
      const wallColor = 0xffffff; // White walls

      // Create floor
      const floorGeometry = new THREE.PlaneGeometry(20, 20);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee, // Light floor
        roughness: 0.5,
        metalness: 0.1
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.7;
      floor.receiveShadow = true;
      scene.add(floor);

      // Create walls
      const createWall = (width: number, height: number, x: number, y: number, z: number, rotationY: number = 0) => {
        const wallGeometry = new THREE.BoxGeometry(width, height, 0.1);
        const wallMaterial = new THREE.MeshStandardMaterial({
          color: wallColor,
          roughness: 0.9,
          metalness: 0.0
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y, z);
        wall.rotation.y = rotationY;
        wall.receiveShadow = true;
        scene.add(wall);
        return wall;
      };

      // Room walls
      const backWall = createWall(14, 8, 0, 3.3, -6);
      const leftWall = createWall(12, 8, -7, 3.3, 0, Math.PI / 2);
      const rightWall = createWall(12, 8, 7, 3.3, 0, -Math.PI / 2);

      // Create sleek desk
      const createDesk = () => {
        // Desk top
        const topGeometry = new THREE.BoxGeometry(3, 0.1, 1.2);
        const topMaterial = new THREE.MeshStandardMaterial({
          color: lightWoodColor, // Light wood
          roughness: 0.3,
          metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 0, -3);
        top.castShadow = true;
        top.receiveShadow = true;
        scene.add(top);

        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 1.2);
        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0xd0d0d0, // Light metal
          roughness: 0.2,
          metalness: 0.8
        });
        
        // Two sleek panel legs
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-1.4, -0.35, -3);
        leg1.castShadow = true;
        scene.add(leg1);
        
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(1.4, -0.35, -3);
        leg2.castShadow = true;
        scene.add(leg2);

        // Add a small plant on the desk
        const potGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.15, 12);
        const potMaterial = new THREE.MeshStandardMaterial({
          color: 0xd4c0a8, // Light pot
          roughness: 0.8,
          metalness: 0.1
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.set(1.2, 0.1, -3);
        pot.castShadow = true;
        pot.receiveShadow = true;
        scene.add(pot);

        // Stylized cactus
        const cactusGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
        const cactusMaterial = new THREE.MeshStandardMaterial({
          color: 0x7caa8e, // Cactus green
          roughness: 1.0,
          metalness: 0
        });
        const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
        cactus.position.set(1.2, 0.25, -3);
        cactus.castShadow = true;
        scene.add(cactus);
      };

      // Create therapist chair
      const createTherapistChair = () => {
        // Chair base/wheels
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333, // Dark base
          roughness: 0.3,
          metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, floor.position.y + 0.05, -0.4);
        base.castShadow = true;
        base.receiveShadow = true;
        scene.add(base);

        // Chair stem
        const stemGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({
          color: 0xd0d0d0, // Chrome
          roughness: 0.1,
          metalness: 0.9
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(0, floor.position.y + 0.45, -0.4);
        stem.castShadow = true;
        scene.add(stem);

        // Chair seat - more cushioned and wider for therapist chair
        const seatGeometry = new THREE.BoxGeometry(0.9, 0.12, 0.8);
        const seatMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333, // Professional dark leather
          roughness: 0.8,
          metalness: 0.2
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, floor.position.y + 0.8, -0.4);
        seat.castShadow = true;
        seat.receiveShadow = true;
        scene.add(seat);

        // Chair back frame
        const backFrameGeometry = new THREE.BoxGeometry(0.9, 1.0, 0.1);
        const backFrame = new THREE.Mesh(backFrameGeometry, seatMaterial);
        backFrame.position.set(0, floor.position.y + 1.3, -0.75);
        backFrame.castShadow = true;
        backFrame.receiveShadow = true;
        scene.add(backFrame);

        // Chair back cushion
        const backCushionGeometry = new THREE.BoxGeometry(0.85, 0.9, 0.07);
        const cushionMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333, // Professional dark leather
          roughness: 0.9,
          metalness: 0.1
        });
        const backCushion = new THREE.Mesh(backCushionGeometry, cushionMaterial);
        backCushion.position.set(0, floor.position.y + 1.3, -0.7);
        backCushion.castShadow = true;
        backCushion.receiveShadow = true;
        scene.add(backCushion);

        // Armrests - professional chair has armrests
        const armrestGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.6);
        const armrestMaterial = new THREE.MeshStandardMaterial({
          color: 0xd0d0d0, // Chrome
          roughness: 0.1,
          metalness: 0.9
        });
        
        // Left armrest
        const leftArmrest = new THREE.Mesh(armrestGeometry, armrestMaterial);
        leftArmrest.position.set(-0.5, floor.position.y + 0.95, -0.5);
        leftArmrest.castShadow = true;
        leftArmrest.receiveShadow = true;
        scene.add(leftArmrest);
        
        // Right armrest
        const rightArmrest = new THREE.Mesh(armrestGeometry, armrestMaterial);
        rightArmrest.position.set(0.5, floor.position.y + 0.95, -0.5);
        rightArmrest.castShadow = true;
        rightArmrest.receiveShadow = true;
        scene.add(rightArmrest);
        
        // Armrest supports - vertical bars
        const armSupportGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
        
        // Left support
        const leftSupport = new THREE.Mesh(armSupportGeometry, armrestMaterial);
        leftSupport.position.set(-0.5, floor.position.y + 0.85, -0.5);
        leftSupport.castShadow = true;
        scene.add(leftSupport);
        
        // Right support
        const rightSupport = new THREE.Mesh(armSupportGeometry, armrestMaterial);
        rightSupport.position.set(0.5, floor.position.y + 0.85, -0.5);
        rightSupport.castShadow = true;
        scene.add(rightSupport);
      };

      // Create sleek bookshelf
      const createBookshelf = () => {
        // Bookshelf frame
        const frameGeometry = new THREE.BoxGeometry(2, 4, 0.4);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: lightWoodColor, // Light wood
          roughness: 0.7,
          metalness: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(-5, 1.3, -5.7);
        frame.castShadow = true;
        frame.receiveShadow = true;
        scene.add(frame);

        // Shelves
        for (let i = 0; i < 4; i++) {
          const shelfGeometry = new THREE.BoxGeometry(1.8, 0.05, 0.45);
          const shelf = new THREE.Mesh(shelfGeometry, frameMaterial);
          shelf.position.set(-5, -0.4 + i * 1.2, -5.7);
          shelf.castShadow = true;
          shelf.receiveShadow = true;
          scene.add(shelf);
        }

        // Books (simplified as colored boxes)
        const bookColors = [
          0x8c7a6b, 0x6a8e7f, 0xb8d0e6, 0xe6ccb8, 0xb8e6cc,
          0xe6b8cc, 0xccb8e6, 0xe6e6b8, 0xb8cce6
        ];

        for (let shelf = 0; shelf < 4; shelf++) {
          let posX = -5.8;
          const posY = -0.15 + shelf * 1.2;
          
          // Add 4-6 books per shelf
          const bookCount = 4 + Math.floor(Math.random() * 3);
          
          for (let i = 0; i < bookCount; i++) {
            const width = 0.1 + Math.random() * 0.2;
            const height = 0.3 + Math.random() * 0.3;
            
            const bookGeometry = new THREE.BoxGeometry(width, height, 0.2);
            const bookMaterial = new THREE.MeshStandardMaterial({
              color: bookColors[Math.floor(Math.random() * bookColors.length)],
              roughness: 0.8,
              metalness: 0.1
            });
            
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.set(posX + width / 2, posY + height / 2, -5.7);
            book.castShadow = true;
            book.receiveShadow = true;
            scene.add(book);
            
            posX += width + 0.02; // Add small gap between books
          }
        }
      };

      // Create the furniture
      createDesk();
      createTherapistChair();
      createBookshelf();

      // Add wall art
      const createWallArt = () => {
        // Picture frame
        const frameGeometry = new THREE.BoxGeometry(1.8, 1.2, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0x8c7a6b, // Wood brown
          roughness: 0.5,
          metalness: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 3.5, -5.94);
        frame.castShadow = true;
        frame.receiveShadow = true;
        scene.add(frame);

        // Picture canvas
        const canvasGeometry = new THREE.PlaneGeometry(1.7, 1.1);
        const canvasMaterial = new THREE.MeshStandardMaterial({
          color: accentColor3,
          roughness: 0.9,
          metalness: 0
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.set(0, 3.5, -5.89);
        scene.add(canvas);

        // Abstract art pattern
        const artGeometry = new THREE.CircleGeometry(0.4, 32);
        const artMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8,
          metalness: 0,
          transparent: true,
          opacity: 0.7
        });
        const art = new THREE.Mesh(artGeometry, artMaterial);
        art.position.set(0, 3.5, -5.88);
        scene.add(art);
      };

      createWallArt();

      // Add floor rug
      const createRug = () => {
        const rugGeometry = new THREE.CircleGeometry(2.5, 32);
        const rugMaterial = new THREE.MeshStandardMaterial({
          color: accentColor3, // Soft blue
          roughness: 1.0,
          metalness: 0
        });
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, -0.69, -3);
        rug.receiveShadow = true;
        scene.add(rug);

        // Add pattern to rug
        const patternGeometry = new THREE.RingGeometry(1.5, 1.6, 32);
        const patternMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 1.0,
          metalness: 0
        });
        const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
        pattern.rotation.x = -Math.PI / 2;
        pattern.position.set(0, -0.68, -3);
        scene.add(pattern);
      };

      createRug();

      // Add a small lamp
      const createLamp = () => {
        // Lamp base
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: 0xd9c2a9, // Wooden base
          roughness: 0.5,
          metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(-4, 0.7, -5);
        base.castShadow = true;
        base.receiveShadow = true;
        scene.add(base);

        // Lamp pole
        const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
          color: 0x8c7a6b,
          roughness: 0.5,
          metalness: 0.3
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(-4, 1, -5);
        pole.castShadow = true;
        scene.add(pole);

        // Lamp shade
        const shadeGeometry = new THREE.ConeGeometry(0.25, 0.3, 16, 1, true);
        const shadeMaterial = new THREE.MeshStandardMaterial({
          color: 0xf5f5f5, // Light fabric
          roughness: 1.0,
          metalness: 0,
          side: THREE.DoubleSide
        });
        const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
        shade.position.set(-4, 1.35, -5);
        shade.rotation.x = Math.PI;
        shade.castShadow = true;
        scene.add(shade);

        // Lamp light
        const lampLight = new THREE.PointLight(0xfff2d9, 1, 5);
        lampLight.position.set(-4, 1.3, -5);
        lampLight.castShadow = true;
        lampLight.shadow.radius = 3;
        scene.add(lampLight);
      };

      createLamp();

      // Add tissues box
      const createTissueBox = () => {
        const boxGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.15);
        const boxMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8,
          metalness: 0.1
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(0.2, 0.07, -3);
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
      };

      createTissueBox();
    };

    createModernOffice();

    // Modern office lighting setup
    // Main key light - bright white light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(-4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Strong fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(4, 4, -4);
    scene.add(fillLight);

    // Strong ambient light for a much brighter environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Additional light for more brightness
    const additionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    additionalLight.position.set(0, 5, 0);
    scene.add(additionalLight);

    // Update camera settings to show full seated character
    const camera = new THREE.PerspectiveCamera(
      26, // Wider angle to capture more of the scene
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    // Position camera to view seated character
    camera.position.set(0, 0.9, 4.5); // Positioned slightly higher and further back
    camera.lookAt(0, 0.6, 0); // Looking at upper body/face area
    cameraRef.current = camera;

    // Adjust OrbitControls for better seated view
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false; // Disable rotation completely
    controls.minDistance = 4.5;
    controls.maxDistance = 4.5;
    // No need for polar angle constraints when rotation is disabled
    controls.target.set(0, 0.6, 0); // Target at torso level
    controls.update();
    controlsRef.current = controls;

    // Load avatar model with adjusted position
    const loader = new GLTFLoader();
    console.log('Starting to load model from:', avatarUrl);
    loader.load(
      avatarUrl,
      (gltf) => {
        const model = gltf.scene;
        
        // Center and position the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Reduced scale and adjusted position for seated view
        const scale = 1.2; // Reduced from 1.5 to make avatar smaller
        model.scale.set(scale, scale, scale);
        
        model.position.x = 0;
        model.position.y = -0.35; // Slightly adjusted to fit chair better
        model.position.z = -0.2; // Moved slightly back to position better on chair
        
        // Enable shadows for the model
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        modelRef.current = model;
        scene.add(model);

        // Initialize animation mixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;
      
        // Enhanced animation logging and initialization
        if (gltf.animations && gltf.animations.length > 0) {
          console.log('Found animations in model:', gltf.animations.length);
          
          // Log details of each animation
          gltf.animations.forEach((anim, index) => {
            const animName = anim.name.toLowerCase();
            console.log(`Animation ${index + 1}:`, {
              name: anim.name,
              duration: anim.duration,
              tracks: anim.tracks.length
            });
            
            // Store animation in our ref
            animationsRef.current[animName] = anim;
          });

          // Log all available animations
          console.log('All available animations:', Object.keys(animationsRef.current));

          // Check for specific built-in animations we're interested in
          const builtInAnims = BUILT_IN_ANIMATIONS.filter(name => 
            Object.keys(animationsRef.current).some(anim => 
              anim.toLowerCase().includes(name.toLowerCase())
            )
          );
          
          console.log('Found built-in animations:', builtInAnims);

          // Start with idle animation if available
          const idleAnim = Object.keys(animationsRef.current).find(name => 
            name.toLowerCase().includes('idle')
          );

          if (idleAnim) {
            console.log('Starting with idle animation:', idleAnim);
            const action = mixer.clipAction(animationsRef.current[idleAnim]);
            action.play();
            currentAnimationRef.current = action;
          } else {
            console.log('No idle animation found, using first available animation');
            const firstAnim = Object.keys(animationsRef.current)[0];
            const action = mixer.clipAction(animationsRef.current[firstAnim]);
            action.play();
            currentAnimationRef.current = action;
          }
        } else {
          console.warn('No animations found in the model');
        }

        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Smooth animation loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      // Check if component is still mounted
      if (!containerRef.current) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        return;
      }
      
      const delta = clock.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Only render if we have both scene and camera
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    // Responsive handling
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      // Remove resize listener
      window.removeEventListener('resize', handleResize);

      // Cancel animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Stop all animations
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      // Dispose of Three.js resources
      if (rendererRef.current) {
        // Remove renderer's DOM element if it exists in the container
        if (containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        
        // Dispose of renderer and its resources
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      // Dispose of controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Clear scene
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      // Clear model reference
      if (modelRef.current) {
        modelRef.current = null;
      }

      // Clear camera
      if (cameraRef.current) {
        cameraRef.current = null;
      }

      // Clear all actions
      currentAnimationRef.current = null;
    };
  }, [avatarUrl, selectedEnvironment]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        cursor: 'default', // Changed from 'grab' to 'default' since rotation is disabled
        touchAction: 'none' // Prevent default touch actions for better control
      }} 
    />
  );
};

export default RPMAvatar;
