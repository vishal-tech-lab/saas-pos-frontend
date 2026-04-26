import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Award, Users, Clock, Phone, Mail, MapPin, ArrowRight, Heart, Truck, Shield, Sparkles, ShoppingCart, Leaf } from 'lucide-react';
import Navbar from '../../components/Navbar'; 

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
      title: "Welcome to",
      subtitle: "Govindan",
      highlight: "Vegetables",
      description: "Premium Quality • Farm Fresh • Organic"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      title: "Fresh Vegetables",
      subtitle: "Available Here",
      highlight: "Daily",
      description: "Handpicked with love every morning"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
      title: "Healthy, Organic",
      subtitle: "& Always",
      highlight: "Fresh",
      description: "Your health is our priority"
    }
  ];

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "100% Organic",
      description: "Pesticide-free vegetables grown with care",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Home Delivery",
      description: "Fresh produce delivered to your doorstep",
      gradient: "from-blue-500 to-teal-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assured",
      description: "Premium grade guarantee on every purchase",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Always Fresh",
      description: "Daily fresh stock from local farms",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "2500+", label: "Happy Customers", icon: <Users className="w-8 h-8" /> },
    { number: "150+", label: "Vegetable Varieties", icon: <Leaf className="w-8 h-8" /> },
    { number: "4.9★", label: "Customer Rating", icon: <Star className="w-8 h-8" /> },
    { number: "24/7", label: "Fresh Supply", icon: <Clock className="w-8 h-8" /> }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      comment: "Best quality vegetables in the city! Always fresh and organic.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5e1?w=150"
    },
    {
      name: "Rajesh Kumar",
      rating: 5,
      comment: "Excellent service and home delivery. Very reliable!",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      name: "Meera Patel",
      rating: 5,
      comment: "Love their organic vegetables. My family's health has improved significantly.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Slider Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Premium Organic Vegetables</span>
            </div>

            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text mb-2 leading-tight">
                {slides[currentSlide].subtitle}
              </h2>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-yellow-400 drop-shadow-lg">
                {slides[currentSlide].highlight}
              </h3>
            </div>

            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              {slides[currentSlide].description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                Shop Fresh Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                <Heart className="w-6 h-6 group-hover:text-red-400 transition-colors" />
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/30 text-white p-4 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-300 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/30 text-white p-4 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-300 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 h-4 bg-white rounded-full shadow-lg'
                  : 'w-4 h-4 bg-white/50 hover:bg-white/75 rounded-full'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-white/60 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-6 py-3 mb-6">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 leading-tight">
              Experience the <span className="text-green-600">Govindan</span> Difference
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              We're committed to bringing you the freshest, healthiest vegetables with unmatched quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-green-500/10 transform hover:-translate-y-4 transition-all duration-500"
              >
                <div className={`bg-gradient-to-r ${feature.gradient} text-white p-5 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 leading-tight">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="container mx-auto px-4 text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/20 p-6 rounded-3xl group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-lg text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                    <p className="text-slate-500 text-sm">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-32 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: <Phone className="w-8 h-8" />, title: "Call Us", info: "+91 98765 43210", gradient: "from-green-500 to-emerald-500" },
              { icon: <Mail className="w-8 h-8" />, title: "Email Us", info: "govindan@vegetables.com", gradient: "from-blue-500 to-teal-500" },
              { icon: <MapPin className="w-8 h-8" />, title: "Visit Us", info: "123 Fresh Market Street", gradient: "from-purple-500 to-indigo-500" }
            ].map((contact, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300">
                <div className={`bg-gradient-to-r ${contact.gradient} text-white p-4 rounded-2xl w-fit mx-auto mb-6`}>
                  {contact.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{contact.title}</h3>
                <p className="text-green-300 text-lg">{contact.info}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 py-12 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white">Govindan Vegetables</h3>
          </div>
          <p className="text-slate-400">© 2026 Govindan Vegetables. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;