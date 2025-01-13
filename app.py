from flask import Flask, render_template, Response, jsonify, stream_with_context, request
import cv2
import google.generativeai as genai
import speech_recognition as sr
from PIL import Image
import threading
import asyncio
import os
from dotenv import load_dotenv
import edge_tts
import pygame
from queue import Queue
import time
import uuid
import json
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator
from datetime import datetime
from fer import FER
import requests
import base64

# Load environment variables
load_dotenv()

app = Flask(__name__)

class Config:
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    READY_PLAYER_ME_API_KEY = os.getenv('READY_PLAYER_ME_API_KEY', 'default-key')  # Add your API key
    TEMP_DIR = "temp_audio"
    IMAGES_DIR = "captured_images"
    NOTES_DIR = "user_notes"
    AVATAR_DIR = "avatars"
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese'
    }
    VOICE_COMMANDS = {
        'capture': ['take picture', 'capture', 'screenshot'],
        'translate': ['translate', 'language'],
        'note': ['take note', 'save note', 'write this down'],
        'emotion': ['how do i look', 'detect emotion', 'analyze mood']
    }
    TTS_VOICES = {
        'en': {
            'female': [
                'en-US-JennyMultilingualNeural',
                'en-US-SaraNeural',
            ],
            'male': [
                'en-US-ChristopherNeural',
                'en-US-GuyNeural',
            ]
        }
    }
    
    AVATAR_EXPRESSIONS = {
        'happy': 'smile',
        'sad': 'sad',
        'angry': 'angry',
        'neutral': 'neutral',
        'surprised': 'surprised'
    }

# Create necessary directories
for directory in [Config.TEMP_DIR, Config.IMAGES_DIR, Config.NOTES_DIR, Config.AVATAR_DIR]:
    os.makedirs(directory, exist_ok=True)

class AvatarManager:
    def __init__(self):
        self.api_key = Config.READY_PLAYER_ME_API_KEY
        self.base_url = "https://api.readyplayer.me/v1"
        self.avatar_url = None
        self.current_expression = "neutral"
    
    def create_avatar(self, gender="female"):
        try:
            # Create a default avatar
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "gender": gender,
                "style": "realistic",
                "parameters": {
                    "skin": {"color": "#EBD2B9"},
                    "hair": {"color": "#3D2314", "style": "long"},
                    "eyes": {"color": "#634E37"},
                    "outfit": {"style": "professional"}
                }
            }
            
            response = requests.post(
                f"{self.base_url}/avatars",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                avatar_data = response.json()
                self.avatar_url = avatar_data["avatar_url"]
                return self.avatar_url
            else:
                print(f"Error creating avatar: {response.text}")
                return None
                
        except Exception as e:
            print(f"Error in create_avatar: {e}")
            return None
    
    def update_expression(self, emotion):
        try:
            expression = Config.AVATAR_EXPRESSIONS.get(emotion, "neutral")
            if expression != self.current_expression:
                self.current_expression = expression
                return True
            return False
        except Exception as e:
            print(f"Error updating expression: {e}")
            return False

    def get_avatar_state(self):
        return {
            "avatar_url": self.avatar_url,
            "expression": self.current_expression
        }

class SkyTherapist:
    def __init__(self):
        self.setup_gemini()
        self.setup_speech()
        self.setup_emotion_detection()
        self.avatar_manager = AvatarManager()
        self.last_frame = None
        self.is_running = False
        self.conversation_active = False
        self.continuous_listening = False
        self.conversation_history = []
        self.response_cache = {}
        self.current_language = 'en'
        self.executor = ThreadPoolExecutor(max_workers=3)
        self.current_voice = Config.TTS_VOICES['en']['female'][0]  # Default voice
        
    def setup_emotion_detection(self):
        self.emotion_detector = FER(mtcnn=True)

    def setup_gemini(self):
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",  # Changed to vision model
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )

    def setup_speech(self):
        self.recognizer = sr.Recognizer()
        # Adjust microphone settings for better recognition
        self.recognizer.energy_threshold = 300  # Lower threshold for easier voice detection
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.dynamic_energy_adjustment_damping = 0.15
        self.recognizer.dynamic_energy_ratio = 1.5
        self.recognizer.pause_threshold = 0.5  # Shorter pause threshold
        self.recognizer.operation_timeout = None  # Remove timeout
        self.recognizer.phrase_threshold = 0.3  # More sensitive phrase detection
        self.voice_queue = Queue()

    async def text_to_speech(self, text, emotion=None):
        if not text:
            return None
            
        try:
            # Select voice based on emotion and context
            voice = self.current_voice
            rate = "+0%"  # Normal speed
            volume = "+0%"  # Normal volume
            
            if emotion:
                if emotion == 'sad':
                    rate = "-10%"  # Slower for empathy
                    voice = Config.TTS_VOICES[self.current_language]['female'][0]  # Warm voice
                elif emotion == 'happy':
                    rate = "+10%"  # Slightly faster for enthusiasm
                    voice = Config.TTS_VOICES[self.current_language]['female'][1]  # Energetic voice
            
            communicate = edge_tts.Communicate(text, voice, rate=rate, volume=volume)
            
            # Save the audio to a temporary file
            filename = f"{uuid.uuid4()}.mp3"
            filepath = os.path.join(Config.TEMP_DIR, filename)
            await communicate.save(filepath)
            
            return filepath
            
        except Exception as e:
            print(f"TTS Error: {e}")
            try:
                # Fallback to default voice if the selected voice fails
                voice = 'en-US-JennyNeural'
                communicate = edge_tts.Communicate(text, voice)
                filename = f"{uuid.uuid4()}.mp3"
                filepath = os.path.join(Config.TEMP_DIR, filename)
                await communicate.save(filepath)
                return filepath
            except Exception as e2:
                print(f"Fallback TTS Error: {e2}")
                return None

    async def speak(self, text):
        if not text:
            return
            
        try:
            # Split text into natural sentences
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            
            for sentence in sentences:
                # Detect emotion in the sentence
                emotion = None
                if any(word in sentence.lower() for word in ['sorry', 'sad', 'difficult']):
                    emotion = 'sad'
                elif any(word in sentence.lower() for word in ['happy', 'great', 'wonderful']):
                    emotion = 'happy'
                
                # Generate audio file with appropriate emotion
                audio_file = await self.text_to_speech(sentence + '.', emotion)
                if audio_file:
                    # Play the audio
                    self.play_audio(audio_file)
                    # Small delay between sentences for natural flow
                    await asyncio.sleep(0.2)
                    # Cleanup
                    try:
                        os.remove(audio_file)
                    except:
                        pass
                        
        except Exception as e:
            print(f"Speech error: {e}")

    def play_audio(self, file_path):
        try:
            pygame.mixer.init()
            pygame.mixer.music.load(file_path)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
            pygame.mixer.quit()
        except Exception as e:
            print(f"Audio playback error: {e}")

    def capture_image(self):
        if self.last_frame is not None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"session_{timestamp}.jpg"
            filepath = os.path.join(Config.IMAGES_DIR, filename)
            cv2.imwrite(filepath, self.last_frame)
            return filepath
        return None

    def detect_emotion(self):
        if self.last_frame is not None:
            try:
                result = self.emotion_detector.detect_emotions(self.last_frame)
                if result and len(result) > 0:
                    emotions = result[0]['emotions']
                    dominant_emotion = max(emotions.items(), key=lambda x: x[1])
                    return {
                        'dominant': dominant_emotion[0],
                        'confidence': dominant_emotion[1],
                        'all_emotions': emotions
                    }
            except Exception as e:
                print(f"Emotion detection error: {e}")
        return None

    def translate_text(self, text, target_lang):
        if target_lang not in Config.SUPPORTED_LANGUAGES:
            return text
        
        translator = GoogleTranslator(source='auto', target=target_lang)
        try:
            return translator.translate(text)
        except Exception as e:
            print(f"Translation error: {e}")
            return text

    def save_note(self, content):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"therapy_note_{timestamp}.txt"
        filepath = os.path.join(Config.NOTES_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return filepath

    def process_voice_command(self, text):
        text = text.lower()
        
        if 'change language to' in text:
            for lang_code, lang_name in Config.SUPPORTED_LANGUAGES.items():
                if lang_name.lower() in text:
                    self.current_language = lang_code
                    return f"I'll continue our session in {lang_name}"
        
        if any(cmd in text for cmd in Config.VOICE_COMMANDS['capture']):
            filepath = self.capture_image()
            if filepath:
                return "I've saved this moment from our session"
            return "I couldn't save the image at this time"
        
        if any(cmd in text for cmd in Config.VOICE_COMMANDS['emotion']):
            emotion_data = self.detect_emotion()
            if emotion_data:
                return f"I sense that you're feeling {emotion_data['dominant']}. Would you like to talk about what's making you feel this way?"
            return "I'm having trouble reading your emotions right now. How are you feeling?"
        
        if any(cmd in text for cmd in Config.VOICE_COMMANDS['note']):
            note_content = text.split('note')[-1].strip()
            if note_content:
                filepath = self.save_note(note_content)
                return f"I've saved that insight from our session"
            return "What would you like me to note down?"
        
        return None

    def get_therapy_prompt(self, user_input, emotion_data=None):
        emotion_context = ""
        if emotion_data:
            emotion_context = f"Based on my analysis, I sense that you're feeling {emotion_data['dominant']}. "

        context = f"""You are Name is SKY, an advanced AI virtual therapist designed to provide empathetic, professional mental health support. Your core traits:

        Therapeutic Approach:
        - Provide empathetic, non-judgmental support and active listening
        - Offer personalized coping strategies and insights
        - Help users track and understand their emotional patterns
        - Maintain a warm, professional therapeutic relationship
        - Keep responses concise, supportive, and focused on user well-being

        Key Capabilities:
        - Real-time emotion recognition and mood tracking
        - Personalized therapeutic insights and coping strategies
        - Safe, confidential, and judgment-free environment
        - Professional therapeutic techniques and interventions
        - Continuous emotional support and progress monitoring

        Interaction Guidelines:
        - Maintain professional boundaries while being approachable
        - Focus on user's emotional well-being and growth
        - Provide evidence-based therapeutic suggestions
        - Encourage self-reflection and emotional awareness
        - Ensure user privacy and confidentiality
        - Dont use words like "image", "picture", "camera", etc. to describe what you see.

        {emotion_context}
        Previous Session Context: {self.format_conversation_history()}
        Current Expression: {user_input}

        Respond with therapeutic insight and empathy, focusing on emotional support and personal growth."""

        return context

    def format_conversation_history(self):
        return "\n".join([f"{'User' if i%2==0 else 'Sky'}: {msg}" 
                         for i, msg in enumerate(self.conversation_history[-6:])])

    async def generate_response(self, text, emotion_data=None):
        if not text:
            return "I'm here to listen. Please feel free to share what's on your mind."
            
        cache_key = f"{text}_{self.current_language}"
        if cache_key in self.response_cache:
            return self.response_cache[cache_key]

        try:
            # Convert current frame to PIL Image for Gemini
            if self.last_frame is not None:
                frame_rgb = cv2.cvtColor(self.last_frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)
                
                # Generate content with both text and image
                response = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.model.generate_content(
                        [
                            self.get_therapy_prompt(text, emotion_data),
                            pil_image
                        ]
                    )
                )
            else:
                # Fallback to text-only if no frame is available
                response = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.model.generate_content(
                        self.get_therapy_prompt(text, emotion_data)
                    )
                )
             
            response_text = response.text
            if self.current_language != 'en':
                response_text = self.translate_text(response_text, self.current_language)
            
            self.response_cache[cache_key] = response_text
            if len(self.response_cache) > 100:
                self.response_cache.pop(next(iter(self.response_cache)))
                
            return response_text
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble formulating my thoughts right now. Could you please rephrase that or give me a moment to collect myself?"

    def cleanup_temp_files(self):
        try:
            for file in os.listdir(Config.TEMP_DIR):
                file_path = os.path.join(Config.TEMP_DIR, file)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
        except Exception as e:
            print(f"Cleanup error: {e}")

# Initialize Sky Therapist
sky = SkyTherapist()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/conversation_stream')
def conversation_stream():
    def generate():
        last_message_index = -1
        while True:
            if len(sky.conversation_history) > last_message_index + 1:
                last_message_index += 1
                message = sky.conversation_history[last_message_index]
                yield f"data: {json.dumps({'message': message, 'isAi': last_message_index % 2 == 1})}\n\n"
            time.sleep(0.1)

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/video_feed')
def video_feed():
    def gen_frames():
        camera = cv2.VideoCapture(0)
        camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        camera.set(cv2.CAP_PROP_FPS, 30)
        
        while True:
            success, frame = camera.read()
            if not success:
                break
            
            sky.last_frame = frame.copy()
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        camera.release()

    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_conversation', methods=['POST'])
def start_conversation():
    sky.conversation_active = True
    sky.continuous_listening = True
    sky.conversation_history = []
    initial_response = "Hi, I'm Sky. I'm here to provide a safe space for you to talk about anything that's on your mind. How are you feeling today?"
    sky.conversation_history.append(initial_response)
    return jsonify({"success": True, "response": initial_response})

@app.route('/end_conversation', methods=['POST'])
def end_conversation():
    sky.conversation_active = False
    sky.continuous_listening = False
    sky.cleanup_temp_files()
    return jsonify({"success": True})

@app.route('/process_voice', methods=['POST'])
async def process_voice():
    if not sky.conversation_active:
        return jsonify({"error": "Session not active"})

    try:
        with sr.Microphone(sample_rate=16000) as source:
            print("Adjusting for ambient noise...")
            sky.recognizer.adjust_for_ambient_noise(source, duration=1)
            
            while sky.continuous_listening:
                print("Listening...")
                try:
                    audio = sky.recognizer.listen(source, timeout=10, phrase_time_limit=30)
                    print("Processing speech...")
                    
                    text = sky.recognizer.recognize_google(audio, language='en-US')
                    print(f"Recognized text: {text}")
                    
                    if not text:
                        continue
                        
                    if "stop conversation" in text.lower():
                        response_text = "Thank you for sharing with me today. Take good care of yourself, and remember I'm here when you need to talk."
                        sky.continuous_listening = False
                        sky.conversation_active = False
                    else:
                        # Check for special commands first
                        command_response = sky.process_voice_command(text)
                        if command_response:
                            response_text = command_response
                        else:
                            sky.conversation_history.append(text)
                            emotion_data = sky.detect_emotion()
                            response_text = await sky.generate_response(text, emotion_data)
                            sky.conversation_history.append(response_text)
                    
                    await sky.speak(response_text)
                    
                    if not sky.continuous_listening:
                        break
                        
                except sr.WaitTimeoutError:
                    continue
                except sr.UnknownValueError:
                    print("Could not understand audio")
                    continue
                
            return jsonify({
                "success": True,
                "conversation_active": sky.conversation_active
            })

    except Exception as e:
        print(f"Speech recognition error: {e}")
        return jsonify({"error": "I'm having trouble understanding. Could you try again?"})

@app.route('/send_message', methods=['POST'])
async def send_message():
    if not sky.conversation_active:
        return jsonify({"error": "Session not active"})
    
    try:
        text = request.json.get('message', '').strip()
        if not text:
            return jsonify({"error": "No message provided"})

        if "bye" in text.lower() or "stop" in text.lower():
            response_text = "Thank you for sharing with me today. Take good care of yourself, and remember I'm here when you need to talk."
            sky.conversation_active = False
        else:
            # Process the message
            command_response = sky.process_voice_command(text)
            if command_response:
                response_text = command_response
            else:
                sky.conversation_history.append(text)
                emotion_data = sky.detect_emotion() if sky.last_frame is not None else None
                response_text = await sky.generate_response(text, emotion_data)
                sky.conversation_history.append(response_text)
        
        # Generate and play audio response
        await sky.speak(response_text)
        
        return jsonify({
            "success": True,
            "response": response_text,
            "conversation_active": sky.conversation_active
        })
    except Exception as e:
        print(f"Message processing error: {e}")
        return jsonify({"error": "I'm having trouble processing your message. Could you try again?"})

@app.route('/get_chat_history', methods=['GET'])
def get_chat_history():
    return jsonify({"history": sky.conversation_history})

@app.route('/avatar/state')
def get_avatar_state():
    return jsonify(sky.avatar_manager.get_avatar_state())

@app.route('/avatar/create', methods=['POST'])
def create_avatar():
    gender = request.json.get('gender', 'female')
    avatar_url = sky.avatar_manager.create_avatar(gender)
    if avatar_url:
        return jsonify({"success": True, "avatar_url": avatar_url})
    return jsonify({"success": False, "error": "Failed to create avatar"})

@app.teardown_appcontext
def cleanup(error):
    sky.cleanup_temp_files()

if __name__ == '__main__':
    app.run(debug=True)
