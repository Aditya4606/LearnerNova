import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Toggle({ checked, onChange, disabled }) {
  const thumbRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (checked) {
      gsap.to(thumbRef.current, { x: 24, duration: 0.3, ease: 'power2.out' });
      gsap.to(trackRef.current, { backgroundColor: '#FB460D', duration: 0.3 });
    } else {
      gsap.to(thumbRef.current, { x: 2, duration: 0.3, ease: 'power2.out' });
      gsap.to(trackRef.current, { backgroundColor: '#EAE4DD', duration: 0.3 });
    }
  }, [checked]);

  return (
    <div 
      ref={trackRef}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-12 h-6 rounded-full relative cursor-pointer interactive ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={{ backgroundColor: '#EAE4DD' }}
    >
      <div 
        ref={thumbRef}
        className="w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] shadow-sm pointer-events-none"
        style={{ transform: 'translateX(2px)' }}
      ></div>
    </div>
  );
}
