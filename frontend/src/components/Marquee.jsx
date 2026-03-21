import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Marquee({ text = "LEARNOVA · LEARN · GROW · ACHIEVE · " }) {
  const containerRef = useRef(null);
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);

  useEffect(() => {
    const width = textRef1.current.offsetWidth;
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(containerRef.current, {
      x: -width,
      duration: 15,
      ease: 'none',
    });

    return () => tl.kill();
  }, []);

  return (
    <div className="w-full overflow-hidden whitespace-nowrap py-10 border-y border-[#EAE4DD] select-none flex">
      <div ref={containerRef} className="flex">
        <div ref={textRef1} className="text-[#FB460D] text-[13px] uppercase tracking-[0.2em] font-bold px-4">
          {text.repeat(10)}
        </div>
        <div ref={textRef2} className="text-[#FB460D] text-[13px] uppercase tracking-[0.2em] font-bold px-4">
          {text.repeat(10)}
        </div>
      </div>
    </div>
  );
}
