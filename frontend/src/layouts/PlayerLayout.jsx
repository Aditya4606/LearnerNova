import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, FileText, Play, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { api } from '../api';
import { useParams } from 'react-router-dom';

export default function PlayerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const navigate = useNavigate();

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course in player", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const lessons = course?.lessons || [];
  const quizzes = course?.quizzes || [];

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
    <div className="flex min-h-screen w-full bg-[#141314]">
      <PageTransition />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-[280px] bg-[#0F0D0E] border-r border-[#EAE4DD] flex flex-col z-20"
      >
        <div className="p-6 border-b border-[#EAE4DD]">
          <h2 className="text-[13px] uppercase tracking-widest text-[#8A817C] font-bold mb-3 truncate">
            {course?.title || 'Loading...'}
          </h2>
          <div className="w-full h-1 bg-[#EAE4DD] rounded-none">
            <div className="h-full bg-[#10B981] w-[40%]"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 bg-[#F5F0EB]/5 border-b border-[#EAE4DD]">
            <p className="text-[10px] uppercase font-black text-[#8A817C] tracking-widest">Modules</p>
          </div>
          {lessons.map((lesson, idx) => (
            <div 
              key={lesson.id} 
              onClick={() => navigate(`/courses/${id}/lesson/${lesson.id}`)}
              className={`p-4 border-b border-[#EAE4DD] flex items-center space-x-3 interactive cursor-pointer hover:bg-[#FFFFFF]`}
            >
              {lesson.status === 'completed' && <CheckCircle2 size={16} className="text-[#FB460D]" />}
              {lesson.status === 'in-progress' && <Play size={16} className="text-[#FB460D]" />}
              {lesson.status === 'not-started' && <div className="w-4 h-4 rounded-full border border-[#8A817C]"></div>}
              
              <div className="flex-1">
                <p className="text-[13px] text-[#141314]">{lesson.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {lesson.type === 'video' ? <Play size={10} className="text-[#8A817C]" /> : <FileText size={10} className="text-[#8A817C]" />}
                  <span className="text-[10px] text-[#8A817C] uppercase tracking-widest">{lesson.type}</span>
                </div>
              </div>
            </div>
          ))}

          {quizzes.length > 0 && (
            <>
              <div className="px-6 py-4 bg-[#F5F0EB]/5 border-b border-[#EAE4DD] mt-4">
                <p className="text-[10px] uppercase font-black text-[#8A817C] tracking-widest">Assessments</p>
              </div>
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  onClick={() => navigate(`/courses/${id}/quiz/${quiz.id}`)}
                  className="p-4 border-b border-[#EAE4DD] flex items-center space-x-3 interactive cursor-pointer hover:bg-[#FFFFFF]"
                >
                  <div className="w-4 h-4 rounded-full border border-[#FB460D] flex items-center justify-center text-[8px] font-bold text-[#FB460D]">Q</div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#141314]">{quiz.title}</p>
                    <p className="text-[9px] text-[#8A817C] uppercase tracking-widest">Assessment</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div 
        ref={mainRef}
        className="flex-1 flex flex-col bg-[#F5F0EB] relative z-10 w-full ml-[280px]"
      >
        <button 
          onClick={toggleSidebar}
          className="absolute left-6 bottom-6 w-10 h-10 bg-[#FFFFFF] border border-[#EAE4DD] flex items-center justify-center text-[#141314] hover:text-[#FB460D] z-50 interactive"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <Outlet />
      </div>
    </div>
  );
}
