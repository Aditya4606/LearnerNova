import React, { useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, FileText, Play, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { MOCK_LESSONS, MOCK_COURSES } from '../mockData';

export default function PlayerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const navigate = useNavigate();

  const course = MOCK_COURSES[0];
  const lessons = MOCK_LESSONS.filter(l => l.courseId === course.id);

  const toggleSidebar = () => {
    const nextState = !sidebarOpen;
    setSidebarOpen(nextState);
    if (!nextState) {
      gsap.to(sidebarRef.current, { x: -280, duration: 0.4, ease: 'power2.inOut' });
      gsap.to(mainRef.current, { marginLeft: 0, duration: 0.4, ease: 'power2.inOut' });
    } else {
      gsap.to(sidebarRef.current, { x: 0, duration: 0.4, ease: 'power2.inOut' });
      gsap.to(mainRef.current, { marginLeft: 280, duration: 0.4, ease: 'power2.inOut' });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0D0B0C] overflow-hidden">
      <PageTransition />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-[280px] bg-[#0F0D0E] border-r border-[#2E2A2B] flex flex-col z-20"
      >
        <div className="p-6 border-b border-[#2E2A2B]">
          <h2 className="text-[13px] uppercase tracking-widest text-[#6B6460] font-bold mb-3 truncate">
            {course.title}
          </h2>
          <div className="w-full h-1 bg-[#2E2A2B] rounded-none">
            <div className="h-full bg-[#10B981] w-[40%]"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, idx) => (
            <div 
              key={lesson.id} 
              className={`p-4 border-b border-[#2E2A2B] flex items-center space-x-3 interactive cursor-pointer hover:bg-[#1C1A1B] ${idx === 0 ? 'bg-[#1C1A1B]' : ''}`}
            >
              {lesson.status === 'completed' && <CheckCircle2 size={16} className="text-[#FB460D]" />}
              {lesson.status === 'in-progress' && <Play size={16} className="text-[#FB460D]" />}
              {lesson.status === 'not-started' && <div className="w-4 h-4 rounded-full border border-[#6B6460]"></div>}
              
              <div className="flex-1">
                <p className={`text-[13px] ${idx === 0 ? 'text-[#FB460D]' : 'text-[#F5F0EB]'}`}>{lesson.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {lesson.type === 'video' ? <Play size={10} className="text-[#6B6460]" /> : <FileText size={10} className="text-[#6B6460]" />}
                  <span className="text-[10px] text-[#6B6460] uppercase tracking-widest">{lesson.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div 
        ref={mainRef}
        className="flex-1 flex flex-col h-full bg-[#141314] relative z-10 w-full ml-[280px]"
      >
        <button 
          onClick={toggleSidebar}
          className="absolute left-6 bottom-6 w-10 h-10 bg-[#1C1A1B] border border-[#2E2A2B] flex items-center justify-center text-[#F5F0EB] hover:text-[#FB460D] z-50 interactive"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <Outlet />
      </div>
    </div>
  );
}
