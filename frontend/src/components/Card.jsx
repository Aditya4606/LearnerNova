import React, { useRef } from 'react';
import gsap from 'gsap';

export default function Card({ children, className = '', hoverEffect = true }) {
  const cardRef = useRef(null);
  const borderRef = useRef(null);

  const handleMouseEnter = () => {
    if (!hoverEffect) return;
    gsap.to(cardRef.current, { y: -4, scale: 1.02, duration: 0.3, ease: 'power2.out' });
    gsap.to(cardRef.current, { borderColor: 'rgba(251, 70, 13, 0.3)', duration: 0.3 });
    gsap.to(borderRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!hoverEffect) return;
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(cardRef.current, { borderColor: '#EAE4DD', duration: 0.3 });
    gsap.to(borderRef.current, { x: '-100%', duration: 0.3, ease: 'power2.out' });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-[#FFFFFF] border border-[#EAE4DD] rounded-none p-6 overflow-hidden interactive ${className}`}
    >
      {/* Animated Left Border */}
      {hoverEffect && (
        <div
          ref={borderRef}
          className="absolute top-0 left-0 bottom-0 w-1 bg-[#FB460D] z-10"
          style={{ transform: 'translateX(-100%)' }}
        ></div>
      )}
      
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
