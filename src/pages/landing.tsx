import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Brain, Shield, Users, Sparkles, ArrowRight, Play } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-black" />,
      title: "24/7 Emotional Support",
      description: "Access empathetic conversations whenever you need them, day or night."
    },
    {
      icon: <Brain className="w-6 h-6 text-black" />,
      title: "AI-Powered Understanding",
      description: "Advanced emotional intelligence that adapts to your unique needs."
    },
    {
      icon: <Shield className="w-6 h-6 text-black" />,
      title: "Complete Privacy",
      description: "Your conversations are private and secure, always."
    },
    {
      icon: <Users className="w-6 h-6 text-black" />,
      title: "Personalized Growth",
      description: "Track your emotional journey and see your progress over time."
    },
    {
      icon: <Heart className="w-6 h-6 text-black" />,
      title: "Holistic Wellness",
      description: "Comprehensive support for mental and emotional well-being."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-black" />,
      title: "Guided Exercises",
      description: "Access meditation and mindfulness exercises tailored to you."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-10"
            poster="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80"
          >
            <source
              src="https://player.vimeo.com/external/454609910.sd.mp4?s=3d21a8de0c416555487c9ba0b0e0364dcd7eec52&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              Find Peace and Clarity with
              <span className="gradient-text block mt-2">AI-Powered Empathetic Support</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Experience a revolutionary approach to emotional well-being with our AI companion that understands, supports, and grows with you.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate('/therapy')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg"
              >
                Start Free Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 px-8 py-6 rounded-xl text-lg"
              >
                Watch Demo
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-black">Why Choose Empathetic Sky?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with human-centered design to provide you with the best emotional support experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-black">Your Journey to Emotional Well-being</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-black">
              Start your path to better emotional health with our simple, effective process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?q=80",
                title: "Start Your Session",
                description: "Begin with a free session and experience our AI's empathetic understanding."
              },
              {
                image: "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?q=80",
                title: "Share Your Thoughts",
                description: "Express yourself freely in a safe, judgment-free environment."
              },
              {
                image: "https://images.unsplash.com/photo-1569437061241-a848be43cc82?q=80",
                title: "Track Your Progress",
                description: "Watch your emotional well-being improve with detailed insights and progress tracking."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-black">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-black">
              Join thousands of users who have found emotional support and growth with Empathetic Sky.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
            {[
              {
                quote: "The AI's responses are incredibly thoughtful and personalized. It feels like talking to a real therapist.",
                author: "Sarah M.",
                role: "User"
              },
              {
                quote: "I love how I can track my emotional progress over time. It's helped me understand my patterns better.",
                author: "David K.",
                role: "User"
              },
              {
                quote: "The guided exercises have been a game-changer for managing my anxiety. Highly recommend!",
                author: "Emma R.",
                role: "User"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="mb-4 text-primary">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-black" >Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-600 mb-8 text-black">
              Take the first step towards better emotional well-being today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/therapy')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg"
            >
              Start Free Session
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
