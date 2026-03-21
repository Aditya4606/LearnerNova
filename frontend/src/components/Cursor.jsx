import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    const onMouseMove = (e) => {
      // Instant movement for dot
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      
      // Lagging movement for ring
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const handleHover = (e) => {
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('.interactive')
      ) {
        gsap.to(ring, { scale: 2, duration: 0.3, ease: 'power2.out' });
        gsap.to(dot, { scale: 0, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.8, duration: 0.1 });
    };

    const onMouseUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.1 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef} 
        className="fixed top-0 left-0 w-10 h-10 border border-[#FB460D] rounded-full pointer-events-none z-[99999]"
        style={{ transform: 'translate(-50%, -50%)' }}
      ></div>
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 w-3 h-3 bg-[#FB460D] rounded-full pointer-events-none z-[99999]"
        style={{ transform: 'translate(-50%, -50%)' }}
      ></div>
    </>
  );
}
