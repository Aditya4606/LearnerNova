import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition() {
  const transitionRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const el = transitionRef.current;
    
    // Animate in
    gsap.set(el, { transformOrigin: 'left center', scaleX: 0 });
    
    gsap.to(el, {
      scaleX: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(el, { transformOrigin: 'right center' });
        gsap.to(el, { scaleX: 0, duration: 0.4, ease: 'power2.inOut' });
      }
    });
  }, [location.pathname]);

  return (
    <div 
      ref={transitionRef} 
      className="fixed inset-0 bg-[#FB460D] z-[9900] pointer-events-none"
    ></div>
  );
}
