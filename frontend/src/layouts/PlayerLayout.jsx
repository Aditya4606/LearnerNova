import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, FileText, Play, CheckCircle2, Image as ImageIcon, Paperclip, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { api } from '../api';

export default function PlayerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { id, lid } = useParams();
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

  // Compute progress
  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const progressPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  // Current lesson ID from URL
  const currentLessonId = lid;

  const toggleSidebar = () => {
    const nextState = !sidebarOpen;
    setSidebarOpen(nextState);
    if (!nextState) {
      gsap.to(sidebarRef.current, { x: -320, duration: 0.4, ease: 'power2.inOut' });
      gsap.to(mainRef.current, { marginLeft: 0, duration: 0.4, ease: 'power2.inOut' });
    } else {
      gsap.to(sidebarRef.current, { x: 0, duration: 0.4, ease: 'power2.inOut' });
      gsap.to(mainRef.current, { marginLeft: 320, duration: 0.4, ease: 'power2.inOut' });
    }
  };

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'video': return <Play size={12} className="text-[#8A817C]" />;
      case 'document': return <FileText size={12} className="text-[#8A817C]" />;
      case 'image': return <ImageIcon size={12} className="text-[#8A817C]" />;
      default: return <FileText size={12} className="text-[#8A817C]" />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#141314]">
      <PageTransition />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-[320px] bg-[#FAFAFA] border-r border-[#EAE4DD] flex flex-col z-20 shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE4DD] bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[12px] uppercase tracking-widest text-[#8A817C] font-bold truncate flex-1 mr-2">
              {course?.title || 'Loading...'}
            </h2>
            <button 
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center text-[#8A817C] hover:text-[#FB460D] transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-[#8A817C] uppercase mb-2">
            <span>Progress</span>
            <span className="text-[#FB460D]">{progressPercent}%</span>
          </div>
          <div className="w-full h-[4px] bg-[#EAE4DD] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-[#8A817C] mt-2 tracking-wider">{completedLessons}/{lessons.length} Modules Completed</p>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 bg-[#F5F0EB]/50 border-b border-[#EAE4DD]">
            <p className="text-[9px] uppercase font-black text-[#8A817C] tracking-[0.15em]">Modules</p>
          </div>
          {lessons.map((lesson, idx) => {
            const isActive = currentLessonId === lesson.id;
            return (
              <div key={lesson.id}>
                <div 
                  onClick={() => navigate(`/courses/${id}/lesson/${lesson.id}`)}
                  className={`px-5 py-4 border-b border-[#EAE4DD]/50 flex items-start space-x-3 cursor-pointer transition-all group ${
                    isActive 
                      ? 'bg-[#FB460D]/5 border-l-[3px] border-l-[#FB460D]' 
                      : 'hover:bg-[#F5F0EB] border-l-[3px] border-l-transparent'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {lesson.status === 'completed' && <CheckCircle2 size={16} className="text-[#3B82F6]" />}
                    {lesson.status === 'in-progress' && (
                      <div className="w-4 h-4 rounded-full border-2 border-[#FB460D] flex items-center justify-center">
                        <Play size={8} className="text-[#FB460D] ml-px" />
                      </div>
                    )}
                    {(!lesson.status || lesson.status === 'not-started') && (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D1CBC5]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${isActive ? 'font-bold text-[#141314]' : 'text-[#555] group-hover:text-[#141314]'} transition-colors truncate`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      {getTypeIcon(lesson.type)}
                      <span className="text-[9px] text-[#8A817C] uppercase tracking-widest font-bold">{lesson.type}</span>
                      {lesson.duration && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#D1CBC5]"></span>
                          <span className="text-[9px] text-[#8A817C] tracking-wider">{lesson.duration}</span>
                        </>
                      )}
                    </div>

                    {/* Attachments under lesson name */}
                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {lesson.attachments.map(att => (
                          <a 
                            key={att.id} 
                            href={att.url?.startsWith('http') ? att.url : `http://localhost:3000${att.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-1.5 text-[9px] text-[#8A817C] hover:text-[#FB460D] transition-colors"
                          >
                            <Paperclip size={9} />
                            <span className="truncate">{att.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <>
              <div className="px-5 py-3 bg-[#F5F0EB]/50 border-b border-[#EAE4DD]">
                <p className="text-[9px] uppercase font-black text-[#8A817C] tracking-[0.15em]">Assessments</p>
              </div>
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  onClick={() => navigate(`/courses/${id}/quiz/${quiz.id}`)}
                  className="px-5 py-4 border-b border-[#EAE4DD]/50 flex items-center space-x-3 cursor-pointer hover:bg-[#F5F0EB] transition-colors border-l-[3px] border-l-transparent"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[#FB460D] flex items-center justify-center text-[7px] font-bold text-[#FB460D]">Q</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#555] truncate">{quiz.title}</p>
                    <p className="text-[9px] text-[#8A817C] uppercase tracking-widest font-bold mt-1">Assessment</p>
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
        className="flex-1 flex flex-col bg-[#F5F0EB] relative z-10 w-full ml-[320px]"
      >
        {/* Toggle button when sidebar is closed */}
        {!sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="fixed left-4 top-4 w-10 h-10 bg-white border border-[#EAE4DD] flex items-center justify-center text-[#141314] hover:text-[#FB460D] z-50 shadow-sm transition-colors"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <Outlet context={{ course, lessons, quizzes }} />
      </div>
    </div>
  );
}
