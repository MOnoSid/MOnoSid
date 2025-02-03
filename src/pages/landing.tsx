import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navigation - Now with blur effect and transition */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src="https://i.imgur.com/rSM4LWK.png" 
                alt="MonoSid Logo" 
                className="h-12 w-12 mr-2" 
                style={{ borderRadius: '50%' }}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                MonoSid
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors hover:scale-105 transform duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors hover:scale-105 transform duration-200">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors hover:scale-105 transform duration-200">Testimonials</a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/therapy')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Free Session
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-screen flex items-center pt-20">
        <motion.div 
          style={{ opacity }}
          className="absolute inset-0 overflow-hidden"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-10"
          >
            <source src="https://cdn.coverr.co/videos/coverr-a-woman-talking-to-her-therapist-2856/1080p.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Path to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience confidential, AI-powered therapy sessions with Dr. Sky. 
              Available 24/7, judgment-free, and personalized to your needs.
            </motion.p>
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/therapy')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Free Session
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-12 flex justify-center items-center space-x-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { value: "100%", label: "Private & Secure" },
                { value: "24/7", label: "Availability" },
                { value: "AI", label: "Powered" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Glass Effect Cards */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/50"></div>
        <div className="container mx-auto px-6 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dr. Sky
            </span>
          </motion.h2>
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
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ delay: feature.delay, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl border border-blue-100 transition-all duration-300"
              >
                <div className="bg-blue-50 rounded-xl p-4 w-16 h-16 mx-auto mb-6">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full stroke-blue-600" 
                    style={{ filter: 'invert(37%) sepia(74%) saturate(1045%) hue-rotate(201deg) brightness(101%) contrast(101%)' }}
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section with Interactive Elements */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-blue-50/30 relative">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Your Journey to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Better Mental Health
            </span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="https://img.freepik.com/free-vector/online-therapy-concept_23-2148525717.jpg" 
                alt="Therapy Session" 
                className="rounded-2xl shadow-2xl"
              />
              <motion.div 
                className="absolute -bottom-8 -right-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-lg font-semibold">Start in 30 Seconds</p>
                <p>No registration required</p>
              </motion.div>
            </motion.div>
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
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 10 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Glass Cards */}
      <section id="testimonials" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white/30"></div>
        <div className="container mx-auto px-6 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            What Our Users Say
          </motion.h2>
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
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg hover:shadow-xl border border-blue-100 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-blue-100"
                  />
                  <div>
                    <div className="font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      {testimonial.author}
                    </div>
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
