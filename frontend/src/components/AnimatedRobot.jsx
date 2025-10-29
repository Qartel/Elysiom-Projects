import React from 'react';
import './AnimatedRobot.css';

const AnimatedRobot = ({ armsPosition = 'normal', dancing = false }) => {
  return (
    <div className="robot-container">
      <svg
        viewBox="0 0 400 500"
        className={`animated-robot ${dancing ? 'robot-dancing' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating particles */}
        <circle className="particle particle-1" cx="50" cy="100" r="3" fill="#a855f7" opacity="0.6" />
        <circle className="particle particle-2" cx="350" cy="150" r="2" fill="#c084fc" opacity="0.6" />
        <circle className="particle particle-3" cx="100" cy="300" r="2.5" fill="#a855f7" opacity="0.6" />
        <circle className="particle particle-4" cx="320" cy="350" r="3" fill="#c084fc" opacity="0.6" />
        
        {/* Robot Head */}
        <g className="robot-head">
          {/* Head base */}
          <rect x="140" y="80" width="120" height="100" rx="15" fill="url(#headGradient)" stroke="#a855f7" strokeWidth="2" />
          
          {/* Antenna */}
          <line x1="200" y1="80" x2="200" y2="50" stroke="#a855f7" strokeWidth="3" className="antenna" />
          <circle cx="200" cy="45" r="8" fill="#c084fc" className="antenna-light" />
          
          {/* Eyes */}
          <g className="eyes">
            <circle cx="170" cy="120" r="15" fill="#1e1b4b" />
            <circle cx="230" cy="120" r="15" fill="#1e1b4b" />
            <circle cx="174" cy="118" r="8" fill="#a855f7" className="eye-glow left-eye" />
            <circle cx="234" cy="118" r="8" fill="#a855f7" className="eye-glow right-eye" />
          </g>
          
          {/* Mouth/Display */}
          <rect x="160" y="150" width="80" height="15" rx="5" fill="#1e1b4b" />
          <rect x="165" y="153" width="15" height="8" rx="2" fill="#a855f7" className="mouth-segment segment-1" />
          <rect x="185" y="153" width="15" height="8" rx="2" fill="#a855f7" className="mouth-segment segment-2" />
          <rect x="205" y="153" width="15" height="8" rx="2" fill="#a855f7" className="mouth-segment segment-3" />
          <rect x="225" y="153" width="10" height="8" rx="2" fill="#a855f7" className="mouth-segment segment-4" />
        </g>
        
        {/* Neck */}
        <rect x="185" y="180" width="30" height="20" fill="url(#bodyGradient)" stroke="#a855f7" strokeWidth="1.5" />
        
        {/* Body/Torso */}
        <g className="robot-body">
          <rect x="130" y="200" width="140" height="160" rx="20" fill="url(#bodyGradient)" stroke="#a855f7" strokeWidth="2" />
          
          {/* Chest panel */}
          <rect x="160" y="230" width="80" height="80" rx="10" fill="#1e1b4b" opacity="0.5" />
          
          {/* Circuit lines */}
          <line x1="200" y1="235" x2="200" y2="305" stroke="#a855f7" strokeWidth="2" className="circuit-line" />
          <circle cx="200" cy="235" r="4" fill="#c084fc" className="circuit-node" />
          <circle cx="200" cy="270" r="4" fill="#c084fc" className="circuit-node" />
          <circle cx="200" cy="305" r="4" fill="#c084fc" className="circuit-node" />
          
          {/* Side indicators */}
          <circle cx="150" cy="250" r="5" fill="#a855f7" className="indicator indicator-1" />
          <circle cx="150" cy="280" r="5" fill="#a855f7" className="indicator indicator-2" />
          <circle cx="250" cy="250" r="5" fill="#a855f7" className="indicator indicator-3" />
          <circle cx="250" cy="280" r="5" fill="#a855f7" className="indicator indicator-4" />
        </g>
        
        {/* Left Arm */}
        <g className={`left-arm ${armsPosition === 'raised' ? 'arms-raised' : armsPosition === 'celebration' ? 'arms-celebration' : ''}`}>
          <rect x="90" y="220" width="35" height="80" rx="17" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <rect x="85" y="300" width="40" height="60" rx="15" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <circle cx="105" cy="340" r="8" fill="#c084fc" className="joint-glow" />
        </g>
        
        {/* Right Arm */}
        <g className={`right-arm ${armsPosition === 'raised' ? 'arms-raised' : armsPosition === 'celebration' ? 'arms-celebration' : ''}`}>
          <rect x="275" y="220" width="35" height="80" rx="17" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <rect x="275" y="300" width="40" height="60" rx="15" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <circle cx="295" cy="340" r="8" fill="#c084fc" className="joint-glow" />
        </g>
        
        {/* Left Leg */}
        <g className="left-leg">
          <rect x="155" y="360" width="35" height="90" rx="17" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <rect x="150" y="450" width="40" height="35" rx="10" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
        </g>
        
        {/* Right Leg */}
        <g className="right-leg">
          <rect x="210" y="360" width="35" height="90" rx="17" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
          <rect x="210" y="450" width="40" height="35" rx="10" fill="url(#limbGradient)" stroke="#a855f7" strokeWidth="2" />
        </g>
        
        {/* Gradients */}
        <defs>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="limbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27234a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        
        {/* Energy field effect */}
        <circle cx="200" cy="300" r="180" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.1" className="energy-field field-1" />
        <circle cx="200" cy="300" r="160" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.1" className="energy-field field-2" />
      </svg>
    </div>
  );
};

export default AnimatedRobot;