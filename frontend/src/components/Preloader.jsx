import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Counter animation
      const counterObj = { val: 0 };
      gsap.to(counterObj, {
        val: 100,
        duration: 1.2,
        ease: 'power1.inOut',
        onUpdate: () => {
          setProgress(Math.round(counterObj.val));
        },
        onComplete: () => {
          // Split animation
          const tl = gsap.timeline({
            onComplete: () => {
              if (onComplete) onComplete();
            }
          });
          
          tl.to(textRef.current, { opacity: 0, duration: 0.3 })
            .to([leftHalfRef.current, rightHalfRef.current], {
              x: (i) => i === 0 ? '-100vw' : '100vw',
              duration: 0.8,
              ease: 'power3.inOut'
            }, "+=0.1")
            .set(containerRef.current, { display: 'none' });
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10000] flex pointer-events-none">
      <div ref={leftHalfRef} className="w-1/2 h-full bg-[#F5F0EB]"></div>
      <div ref={rightHalfRef} className="w-1/2 h-full bg-[#F5F0EB]"></div>
      
      <div 
        ref={textRef} 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-4"
      >
        <div className="text-[#141314] text-sm uppercase tracking-[0.2em] font-bold">
          Learnova
        </div>
        <div className="text-[#FB460D] font-bold text-6xl">
          {progress.toString().padStart(3, '0')}
        </div>
      </div>
    </div>
  );
}
