import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Show modal
      gsap.set(overlayRef.current, { display: 'flex' });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(panelRef.current, 
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    } else if (overlayRef.current) {
      // Hide modal
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlayRef.current, { display: 'none' });
        }
      });
      tl.to(panelRef.current, { scale: 0.92, opacity: 0, duration: 0.3, ease: 'power2.in' })
        .to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' }, "-=0.2");
    }
  }, [isOpen]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[5000] hidden items-center justify-center bg-[#141314]/90 backdrop-blur"
      style={{ opacity: 0 }}
    >
      {/* Background click listener */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>
      
      <div 
        ref={panelRef}
        className="relative bg-[#1C1A1B] border border-[#2E2A2B] p-10 max-w-2xl w-full m-4 z-10 rounded-none shadow-2xl"
      >
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-[#F5F0EB] tracking-wide uppercase">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
