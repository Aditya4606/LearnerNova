import React, { useRef } from 'react';
import gsap from 'gsap';

export default function Button({ variant = 'primary', children, onClick, className = '' }) {
  const btnRef = useRef(null);

  const handleHover = (isHovering) => {
    if (variant === 'primary') {
      gsap.to(btnRef.current, { filter: isHovering ? 'brightness(1.1)' : 'brightness(1)', duration: 0.2 });
    } else {
      gsap.to(btnRef.current, { 
        backgroundColor: isHovering ? '#FB460D' : 'transparent', 
        borderColor: isHovering ? '#FB460D' : 'rgba(245, 240, 235, 0.2)',
        duration: 0.25 
      });
    }
  };

  const handleClick = (e) => {
    const tl = gsap.timeline();
    tl.to(btnRef.current, { scale: 0.97, duration: 0.1 })
      .to(btnRef.current, { scale: 1, duration: 0.1 });
      
    if (onClick) onClick(e);
  };

  const baseClasses = "px-8 py-4 uppercase tracking-[0.12em] text-[11px] font-bold transition-none rounded-none outline-none interactive";
  
  const variantClasses = variant === 'primary' 
    ? "bg-[#FB460D] text-white border-0" 
    : "bg-transparent border border-[#F5F0EB]/20 text-[#F5F0EB]";

  return (
    <button
      ref={btnRef}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}
