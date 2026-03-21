import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Input({ label, type = 'text', placeholder, value, onChange, disabled }) {
  const borderRef = useRef(null);

  const handleFocus = () => {
    gsap.to(borderRef.current, { borderColor: '#FB460D', duration: 0.3 });
  };

  const handleBlur = () => {
    gsap.to(borderRef.current, { borderColor: '#EAE4DD', duration: 0.3 });
  };

  return (
    <div className="w-full relative flex flex-col mb-4">
      {label && <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="bg-transparent border-0 border-b border-[#EAE4DD] text-[#141314] text-[15px] px-0 py-3 w-full outline-none interactive"
        ref={borderRef}
      />
    </div>
  );
}
