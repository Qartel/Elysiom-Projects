import React, { useState, useEffect } from 'react';
import { Bot, TrendingUp, Zap, ArrowRight, Menu, X, ChevronRight, Star, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { services, products, caseStudies, testimonials, stats } from '../mock';
import AnimatedRobot from './AnimatedRobot';

const iconMap = {
  Bot: Bot,
  TrendingUp: TrendingUp,
  Zap: Zap
};

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [robotState, setRobotState] = useState({ dancing: false, color: 'purple' });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    const handleRobotAction = (action) => {
    let color = 'purple';
    if (action === 'no') color = 'red';
    if (action === 'maybe') color = 'blue';
    if (action === 'yes') color = 'green';
    
    setRobotState({ dancing: true, color, action });
    setTimeout(() => {
      setRobotState({ dancing: false, color: 'purple', action: null });
    }, 1200);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Far Left */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">ELYSIOM</span>
              </span>
            </div>

            {/* Navigation - Top Middle */}
            <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              <button onClick={() => scrollToSection('home')} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('products')} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('services')} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>

            {/* CTA Button */}
            <Button onClick={() => scrollToSection('contact')} className="hidden md:flex bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-3">
                <button onClick={() => scrollToSection('home')} className="text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors duration-200">Home</button>
                <button onClick={() => scrollToSection('products')} className="text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors duration-200">Products</button>
                <button onClick={() => scrollToSection('services')} className="text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-colors duration-200">Services</button>
                <Button onClick={() => scrollToSection('contact')} className="bg-purple-600 hover:bg-purple-700 text-white">Get Started</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Full Screen with Border Container */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 lg:px-12 pt-20">
        <div className="max-w-[1400px] w-full mx-auto my-8 lg:my-12">
          <div className="border-2 border-gray-800 rounded-3xl p-8 lg:p-16 min-h-[calc(100vh-200px)] flex items-center relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
              {/* Left Content */}
              <div className="space-y-8">
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 px-4 py-1.5 text-sm font-medium hover:bg-purple-900/50 transition-colors duration-300">
                  Next-Gen Automation Platform
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white">Intelligent</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">Agents</span>{' '}
                  <span className="text-white">For Your Business</span>
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                  Transform your operations with cutting-edge agentic automation. Deploy intelligent agents that work autonomously, learn continuously, and deliver exceptional results.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => scrollToSection('contact')} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105">
                    Start Free Trial
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button onClick={() => scrollToSection('products')} size="lg" variant="outline" className="border-2 border-gray-700 text-white hover:bg-gray-900 px-8 py-6 text-lg rounded-xl transition-all duration-300">
                    View Products
                  </Button>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Animated Robot */}
              {/* Right - Animated Robot */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="aspect-square relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
                    <div 
                      className={`relative transition-all duration-300 ${
                        robotState.dancing 
                          ? `animate-robot-${robotState.action}` 
                          : ''
                      }`}
                      style={{
                        filter: robotState.dancing 
                          ? `drop-shadow(0 0 80px rgba(${
                              robotState.color === 'red' ? '239, 68, 68' :
                              robotState.color === 'blue' ? '59, 130, 246' :
                              robotState.color === 'green' ? '34, 197, 94' :
                              '147, 51, 234'
                            }, 0.8))` 
                          : 'drop-shadow(0 0 60px rgba(147, 51, 234, 0.4))'
                      }}
                    >
                      <AnimatedRobot armsPosition={
                        robotState.dancing 
                          ? (robotState.action === 'yes' ? 'celebration' : 
                             robotState.action === 'no' ? 'raised' : 'normal')
                          : 'normal'
                      } />
                    </div>
                    {/* Floating particles */}
                    <div className={`absolute top-1/4 left-1/4 w-3 h-3 rounded-full ${robotState.dancing ? 'animate-ping-fast' : 'animate-ping'}`}
                      style={{ backgroundColor: robotState.dancing ? 
                        (robotState.color === 'red' ? '#ef4444' : 
                         robotState.color === 'blue' ? '#3b82f6' : 
                         robotState.color === 'green' ? '#22c55e' : '#a855f7') : '#a855f7' 
                      }}></div>
                    <div className={`absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full ${robotState.dancing ? 'animate-ping-fast' : 'animate-ping'}`} 
                      style={{ 
                        animationDelay: '0.5s',
                        backgroundColor: robotState.dancing ? 
                          (robotState.color === 'red' ? '#f87171' : 
                           robotState.color === 'blue' ? '#60a5fa' : 
                           robotState.color === 'green' ? '#4ade80' : '#c084fc') : '#c084fc' 
                      }}></div>
                    <div className={`absolute top-1/2 right-1/3 w-2 h-2 rounded-full ${robotState.dancing ? 'animate-ping-fast' : 'animate-ping'}`} 
                      style={{ 
                        animationDelay: '1s',
                        backgroundColor: robotState.dancing ? 
                          (robotState.color === 'red' ? '#dc2626' : 
                           robotState.color === 'blue' ? '#2563eb' : 
                           robotState.color === 'green' ? '#16a34a' : '#9333ea') : '#9333ea' 
                      }}></div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 justify-center">
                    <Button
                      onClick={() => handleRobotAction('no')}
                      disabled={robotState.dancing}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      No
                    </Button>
                    <Button
                      onClick={() => handleRobotAction('maybe')}
                      disabled={robotState.dancing}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Maybe
                    </Button>
                    <Button
                      onClick={() => handleRobotAction('yes')}
                      disabled={robotState.dancing}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Yes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 px-6 lg:px-12 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 px-4 py-1.5 text-sm font-medium">
              Our Products
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Built For <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Scale</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Enterprise-grade solutions that grow with your business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={product.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{product.name}</CardTitle>
                  <CardDescription className="text-gray-400 mt-3">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                          <ChevronRight className="w-4 h-4 text-purple-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-800">
                      <div className="text-2xl font-bold text-purple-400">{product.price}</div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">Learn More</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 lg:px-12 bg-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 px-4 py-1.5 text-sm font-medium">
              What We Do
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Our <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Services</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Comprehensive automation solutions tailored to your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon];
              return (
                <div key={service.id} className="group relative" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Card className="relative bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-white">{service.title}</CardTitle>
                      <CardDescription className="text-gray-400 mt-3 leading-relaxed">{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 px-4 py-1.5 text-sm font-medium">
              Success Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Proven <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Results</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">See how we've transformed businesses across industries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={study.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 hover:-translate-y-2 group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">{study.metric}</div>
                  <div className="text-sm text-purple-400 mb-4">{study.metricLabel}</div>
                  <CardTitle className="text-xl font-bold text-white">{study.company}</CardTitle>
                  <Badge variant="outline" className="w-fit border-gray-700 text-gray-400 mt-2">{study.industry}</Badge>
                  <CardDescription className="text-gray-400 mt-4 leading-relaxed">{study.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 lg:px-12 bg-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700 px-4 py-1.5 text-sm font-medium">
              Testimonials
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Loved By <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Leaders</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-700 transition-all duration-300 group" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-purple-500 text-purple-500" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">"{testimonial.content}"</p>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="py-24 px-6 lg:px-12 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="border-2 border-gray-800 rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-900/10"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-bold">
                Ready To <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Transform</span> Your Business?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join hundreds of companies leveraging the power of agentic automation. Start your journey today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105">
                  Schedule Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-gray-700 text-white hover:bg-gray-900 px-10 py-6 text-lg rounded-xl transition-all duration-300">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-black border-t border-gray-900">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">ELYSIOM</span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Elysiom. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;