import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="https://i.imgur.com/rSM4LWK.png" alt="MonoSid Logo" className="h-12 w-12 mr-2" style={{ borderRadius: '50%' }}/>
            <span className="text-2xl font-bold text-blue-600">MonoSid</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
            <Button
              onClick={() => navigate('/therapy')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Start Free Session
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="https://cdn.coverr.co/videos/coverr-a-woman-talking-to-her-therapist-2856/1080p.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Your Path to <span className="text-blue-600">Mental Wellness</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience confidential, AI-powered therapy sessions with Dr. Sky. 
              Available 24/7, judgment-free, and personalized to your needs.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/therapy')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                Start Free Session
              </Button>
              <Button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
            <div className="mt-12 flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-gray-600">Private & Secure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">AI</div>
                <div className="text-gray-600">Powered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose <span className="text-blue-600">Dr. Sky</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "24/7 Emotional Support",
                description: "Access therapeutic support anytime, anywhere. No appointments needed, no waiting lists.",
                image: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/clock.svg",
                delay: 0
              },
              {
                title: "Complete Privacy",
                description: "Your conversations are 100% private and secure. We use state-of-the-art encryption.",
                image: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg",
                delay: 0.2
              },
              {
                title: "AI-Powered Empathy",
                description: "Experience conversations that understand and adapt to your emotional needs.",
                image: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay }}
                className="bg-blue-50 rounded-xl p-8 hover:shadow-xl transition-shadow"
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-16 h-16 mx-auto mb-6 stroke-blue-600" 
                  style={{ filter: 'invert(37%) sepia(74%) saturate(1045%) hue-rotate(201deg) brightness(101%) contrast(101%)' }}
                />
                <h3 className="text-2xl font-semibold mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section with Interactive Elements */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Your Journey to <span className="text-blue-600">Better Mental Health</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://img.freepik.com/free-vector/online-therapy-concept_23-2148525717.jpg" 
                alt="Therapy Session" 
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-lg">
                <p className="text-lg font-semibold">Start in 30 Seconds</p>
                <p>No registration required</p>
              </div>
            </div>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Click 'Start Session'",
                  description: "Begin instantly - no registration or waiting"
                },
                {
                  step: "2",
                  title: "Voice or Text Chat",
                  description: "Communicate naturally using voice or text"
                },
                {
                  step: "3",
                  title: "Get Support",
                  description: "Receive empathetic, personalized guidance"
                },
                {
                  step: "4",
                  title: "Track Progress",
                  description: "Monitor your emotional well-being journey"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Dr. Sky helped me through a difficult time when I needed someone to talk to at 3 AM.",
                author: "Sarah M.",
                image: "https://randomuser.me/api/portraits/women/1.jpg"
              },
              {
                quote: "The voice interaction feels incredibly natural. It's like talking to a real therapist.",
                author: "James K.",
                image: "https://randomuser.me/api/portraits/men/1.jpg"
              },
              {
                quote: "I appreciate the privacy and convenience. No scheduling, no waiting rooms.",
                author: "Emily R.",
                image: "https://randomuser.me/api/portraits/women/2.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 p-8 rounded-xl"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-blue-600">Verified User</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Background Image */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1573166364524-748b12e70a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental health.
            Start a free session with Dr. Sky today.
          </p>
          <Button
            onClick={() => navigate('/therapy')}
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
          >
            Start Free Session Now
          </Button>
          <p className="mt-6 text-blue-100">No credit card required • Start instantly</p>
        </div>
      </section>

      {/* Footer with Trust Signals */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="https://img.icons8.com/clouds/100/therapy.png" alt="Dr. Sky Logo" className="h-10 w-10 mr-2" />
                <span className="text-xl font-bold text-white">Dr. Sky</span>
              </div>
              <p className="text-sm">
                Your AI therapy companion, available 24/7 for emotional support and guidance.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Trust & Safety</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
              <p className="text-sm mb-4">
                Questions? Reach out to us at support@drsky.ai
              </p>
              <div className="flex space-x-4">
                <img src="https://img.shields.io/badge/256bit-SSL%20Encrypted-green" alt="SSL Badge" />
                <img src="https://img.shields.io/badge/HIPAA-Compliant-blue" alt="HIPAA Badge" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p> 2023 Dr. Sky. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
