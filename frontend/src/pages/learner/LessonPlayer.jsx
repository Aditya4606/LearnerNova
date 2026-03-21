import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Button from '../../components/Button';

export default function LessonPlayer() {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const quizIntroRef = useRef(null);

  useEffect(() => {
    if (showQuiz && quizIntroRef.current) {
      const elements = quizIntroRef.current.children;
      gsap.fromTo(elements,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [showQuiz]);

  const toggleQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Top Bar relative to Player viewport */}
      <div className="flex-shrink-0 h-[72px] bg-[#F5F0EB] border-b border-[#EAE4DD] px-8 flex items-center justify-between">
        <button className="text-[11px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest interactive flex items-center" onClick={() => navigate(-1)}>
          ← BACK
        </button>
        <span className="text-[14px] font-bold text-[#141314]">Compound Components</span>
        <div className="w-16"></div> {/* Spacer */}
      </div>

      <div className="p-8 bg-[#F5F0EB] flex-shrink-0 text-center border-b border-[#EAE4DD]">
        <h2 className="text-[24px] font-bold text-[#141314] tracking-wide mb-2">Compound Components</h2>
        <p className="text-[14px] text-[#8A817C] max-w-2xl mx-auto">
          Learn how to build expressive and flexible APIs using the compound component pattern in React.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#141314] flex flex-col pt-12 items-center px-8 pb-32">
        
        {!showQuiz ? (
          <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="aspect-video w-full bg-[#FFFFFF] border border-[#EAE4DD] relative flex items-center justify-center group">
              {/* Mock Video Player */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-black to-[#1A1A1A]"></div>
              <div className="w-20 h-20 bg-[#FB460D] rounded-full flex items-center justify-center z-10 interactive cursor-pointer group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button onClick={toggleQuiz}>START LESSON QUIZ</Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto flex flex-col h-full justify-center" ref={quizIntroRef}>
            <div className="mb-4 inline-block">
              <span className="border border-[#FB460D] bg-[#FB460D]/10 text-[#FB460D] text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1">MULTIPLE ATTEMPTS</span>
            </div>
            <h2 className="text-[48px] font-bold text-[#141314] mb-8 leading-tight tracking-[-0.02em]">
              Compound Components Mastery Quiz
            </h2>
            <div className="flex items-center space-x-6 text-[12px] font-bold text-[#8A817C] tracking-widest uppercase mb-12 border-t border-[#EAE4DD] pt-6">
              <span>04 QUESTIONS</span>
              <span>10 PTS MAX</span>
            </div>
            <div>
              <Button onClick={() => alert("Quiz interactive flow begins... (See prompt specs)")} className="!px-12 py-5 text-[14px]">BEGIN QUIZ →</Button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#F5F0EB]/90 backdrop-blur border-t border-[#EAE4DD] flex items-center justify-between px-8 z-50">
        <Button variant="ghost">← PREVIOUS</Button>
        <Button>NEXT CONTENT →</Button>
      </div>

    </div>
  );
}
