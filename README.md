# MonoSid - AI Therapy Companion

MonoSid is an innovative AI-powered therapy companion that combines real-time video interaction, natural language processing, emotion detection, and a lifelike digital avatar to provide a supportive and engaging therapeutic experience.

## 🌟 Features

### Core Features

* Real-time video conversations with emotion detection
* Lifelike 3D digital avatar with facial expressions (Beta)
* Continuous voice conversation capability
* Natural language understanding and empathetic responses
* Real-time emotion analysis and adaptive responses

### Advanced Capabilities

* **Digital Avatar**:  
   * Realistic 3D avatar powered by ReadyPlayerMe  
   * Dynamic facial expressions matching conversation emotions  
   * Smooth transitions between expressions  
   * Professional appearance and demeanor
* **Emotion Detection**:  
   * Real-time facial expression analysis  
   * Emotional state tracking  
   * Adaptive therapeutic responses
* **Continuous Conversation**:  
   * Natural, flowing conversations  
   * No need to click for each response  
   * Automatic speech detection  
   * Seamless turn-taking
* **Multilingual Support**:  
   * English, Spanish, French, German  
   * Italian, Japanese, Korean, Chinese  
   * Real-time translation  
   * Voice synthesis in multiple languages
* **Session Management**:  
   * Image capture functionality  
   * Session notes and insights  
   * Emotion tracking over time  
   * Progress monitoring

## 🚀 Installation

1. Clone the repository:
```sh
git clone https://github.com/MOnoSid/MOnoSid.git
cd MOnoSid
```

2. Install required packages:
```sh
npm install
```

3. Set up environment variables: Create a `.env` file with:
```
GOOGLE_API_KEY=your_google_api_key
READY_PLAYER_ME_API_KEY=your_readyplayer_api_key
VITE_APP_ENV=development
```

## 🎮 Usage

1. Start the application:
```sh
npm run dev
```

2. Open your browser:
```
http://localhost:5173
```

3. Interaction Modes:
* **Video Mode**: Face-to-face conversations with emotion detection
* **Avatar Mode**: Interact with Sky's realistic 3D avatar (Under Development)
* **Voice Mode**: Natural voice conversations with continuous dialogue

4. Features:
* Click "Start Session" to begin
* Use "Voice Input" for continuous conversation
* Switch between video and avatar views
* Watch the avatar respond with appropriate expressions
* End session anytime with "stop conversation" command

## 🏗️ Project Structure

```
.
├── src/               # Source code
│   ├── components/    # UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Core library functions
│   ├── pages/         # Application pages
│   ├── styles/        # CSS styles
│   ├── utils/         # Utility functions
│   └── App.tsx        # Main application component
├── public/            # Static assets
├── index.html         # HTML entry point
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## 🔧 Dependencies

* React: UI framework
* Three.js: 3D rendering
* Google Generative AI: Natural language processing
* ReadyPlayerMe SDK: 3D avatar generation
* TensorFlow.js: Facial landmark detection
* WebRTC: Real-time communication
* Tailwind CSS: Styling

## 🌐 Browser Support

* Chrome (recommended)
* Firefox
* Edge
* Safari

## 🔒 Privacy & Security

* All sessions are private and not recorded
* Data is processed locally
* Secure avatar generation and rendering
* No persistent data storage
* GDPR compliant data handling

## ⚠️ Note on Digital Avatar (Under Development)

The digital avatar feature is currently in beta and under active development. Current limitations:

* Avatar generation may take a few moments
* Some expressions are still being refined
* Occasional animation transitions may need smoothing
* More customization options coming soon

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

* ReadyPlayerMe for the 3D avatar technology
* Google for the Generative AI capabilities
* The open-source community for various tools and libraries
