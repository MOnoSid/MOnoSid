import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Brain, Shield, Sparkles, ArrowRight, MessageCircle, Heart, Star, ChevronDown, Play, Pause } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const imageHover = {
  rest: { scale: 1, transition: { duration: 0.5, type: "tween", ease: "easeOut" } },
  hover: { scale: 1.05, transition: { duration: 0.5, type: "tween", ease: "easeOut" } }
};

const buttonHover = {
  rest: { scale: 1, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" },
  hover: { scale: 1.05, boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)" }
};

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const backgroundY = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <motion.div
          className="fixed inset-0 -z-10"
          style={{ opacity }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),rgba(99,102,241,0))]" />
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              y: backgroundY
            }}
          />
        </motion.div>

        {/* Navigation with smooth reveal */}
        <motion.nav
          className="fixed top-0 w-full z-50 py-4"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_-12px_rgba(0,0,0,0.1)]" />
          <div className="container mx-auto px-6 relative">
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-[2px] group">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <img
                      src="public/favicon.ico"
                      alt="Dr. Sky Logo"
                      className="w-7 h-7"
                    />
                  </div>
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MonoSid</span>
              </motion.div>

              <div className="hidden md:flex items-center gap-8">
                {['Home', 'Features', 'About', 'Contact'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="relative text-gray-600 hover:text-gray-900 transition-colors group"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/therapy')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 relative group"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                  <span className="relative">Start Free Session</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with staggered animations */}
        <motion.section
          className="pt-28 pb-16 overflow-hidden"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          ref={containerRef}
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left content with staggered fade-in */}
              <motion.div
                variants={fadeInUp}
                className="flex-1"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 mb-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Therapy</span>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                  variants={fadeInUp}
                >
                  <motion.span
                    className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your Personal
                  </motion.span>
                  <motion.span
                    className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2"
                    animate={{
                      backgroundPosition: ['0%', '100%', '0%'],
                      opacity: [0, 1],
                      y: [-20, 0]
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      opacity: { duration: 0.5, delay: 0.4 },
                      y: { duration: 0.5, delay: 0.4 }
                    }}
                    style={{
                      backgroundSize: '200% 100%'
                    }}
                  >
                    AI Therapist
                  </motion.span>
                </motion.h1>

                <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                  Experience a new era of mental wellness with Dr. Sky. Advanced AI technology meets genuine empathy for personalized support.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate('/therapy')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 relative group w-full sm:w-auto"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                      <span className="relative flex items-center gap-2">
                        Begin Your Journey
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-5 rounded-full group w-full sm:w-auto"
                    >
                      <span className="relative flex items-center gap-2">
                        Learn More
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right content with image grid animations */}
              <motion.div
                className="flex-1 relative grid grid-cols-2 gap-3"
                variants={fadeInUp}
                style={{
                  transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.01}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) * -0.01}deg)`
                }}
              >
                <div className="space-y-3">
                  <motion.div
                    className="relative rounded-xl overflow-hidden"
                    variants={imageHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="rest"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21"
                      alt="Therapy Session 1"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                  <motion.div
                    className="relative rounded-xl overflow-hidden"
                    variants={imageHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="rest"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1590650153855-d9e808231d41"
                      alt="Therapy Session 2"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                </div>
                <div className="space-y-3 pt-6">
                  <motion.div
                    className="relative rounded-xl overflow-hidden"
                    variants={imageHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="rest"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1553877522-43269d4ea984"
                      alt="Therapy Session 3"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                  <motion.div
                    className="relative rounded-xl overflow-hidden"
                    variants={imageHover}
                    initial="rest"
                    whileHover="hover"
                    whileTap="rest"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f"
                      alt="Therapy Session 4"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                </div>

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 1, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Empathetic Support</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Video Section with smooth reveal */}
        <motion.section
          className="py-24 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-50 opacity-50" />
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-3.5 h-3.5" />
                <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Watch Demo</span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">See Dr. Sky in</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Action</span>
              </h2>

              <p className="text-lg text-gray-600">
                Watch how Dr. Sky provides compassionate and effective therapy sessions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="aspect-w-16 aspect-h-9 relative group"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1573497620053-ea5300f94f21"
                >
                  <source src="/path-to-your-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <button
                  onClick={toggleVideo}
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Play className="w-5 h-5 text-blue-600 translate-x-0.5" />
                    )}
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section with staggered reveal */}
        <motion.section
          className="py-24 relative"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          id="features"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-purple-50 opacity-50" />
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Why Choose</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Dr. Sky?</span>
              </h2>

              <p className="text-lg text-gray-600">
                Experience the perfect blend of advanced technology and human-like understanding
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
                <motion.div
                key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                  className="group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 h-full">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section with smooth transitions */}
        <motion.section
          className="py-24 relative"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          id="about"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white opacity-50" />
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 mb-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-3.5 h-3.5" />
                <span className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">How It Works</span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Start Your</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Journey Today</span>
              </h2>

              <p className="text-lg text-gray-600">
                Begin your path to better mental wellness in just a few simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                  className="relative"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 h-full">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center mb-4">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 right-0 w-full h-[1px] bg-gradient-to-r from-blue-100 to-purple-100 -z-10 transform translate-x-1/2">
                      <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer with fade-in animation */}
        <motion.footer
          className="bg-white py-12 border-t border-gray-100"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="contact"
        >
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-[2px] group">
                    <div className="relative w-full h-full rounded-lg bg-white flex items-center justify-center">
                      <img
                        src="public/favicon.ico"
                        alt="Dr. Sky Logo"
                        className="w-6 h-6"
                      />
                    </div>
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MonoSid</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pioneering the future of mental wellness through AI-powered therapy.
                </p>
              </div>

              {footerLinks.map((section, index) => (
                <div key={index}>
                  <h4 className="text-gray-900 font-semibold mb-3 text-sm">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
              </div>
            ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">© 2024 MonoSid. All rights reserved.</p>
              <div className="flex gap-5">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </motion.footer>
      </motion.div>
    </AnimatePresence>
  );
};

const features = [
  {
    title: "AI-Powered Therapy",
    description: "Experience personalized therapeutic conversations that adapt to your unique emotional needs.",
    icon: <Brain className="w-6 h-6 text-blue-600" />
  },
  {
    title: "Natural Dialogue",
    description: "Engage in fluid conversations that feel natural and understanding, just like talking to a human therapist.",
    icon: <MessageCircle className="w-6 h-6 text-blue-600" />
  },
  {
    title: "Secure & Private",
    description: "Your conversations are protected with enterprise-grade security and complete confidentiality.",
    icon: <Shield className="w-6 h-6 text-blue-600" />
  }
];

const stats = [
  {
    value: "24/7",
    label: "Support"
  },
  {
    value: "100%",
    label: "Private"
  },
  {
    value: "1M+",
    label: "Sessions"
  }
];

const steps = [
  {
    title: "Create Account",
    description: "Sign up in seconds with just your email - no credit card required."
  },
  {
    title: "Start Session",
    description: "Begin your therapeutic journey with a simple click."
  },
  {
    title: "Feel Better",
    description: "Experience improved mental wellness with ongoing support."
  }
];

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Security", "Testimonials", "Pricing"]
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"]
  },
  {
    title: "Resources",
    links: ["Documentation", "Support", "FAQ", "Community"]
  }
];

export default Landing;
