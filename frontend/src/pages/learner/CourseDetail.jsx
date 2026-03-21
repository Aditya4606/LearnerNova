import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, CheckCircle2, Circle, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleTabClick = (tab, e) => {
    setActiveTab(tab);
    if (!tabsRef.current || !tabUnderlineRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const parentRect = tabsRef.current.getBoundingClientRect();
    gsap.to(tabUnderlineRef.current, {
      x: rect.left - parentRect.left,
      width: rect.width,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const initTabRef = (el) => {
    if (el && activeTab === 'OVERVIEW' && tabUnderlineRef.current && tabUnderlineRef.current.style.width === '') {
      const rect = el.getBoundingClientRect();
      const parentRect = tabsRef.current?.getBoundingClientRect();
      if (!parentRect) return;
      gsap.set(tabUnderlineRef.current, {
        x: rect.left - parentRect.left,
        width: rect.width
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-[#EAE4DD] border-t-[#FB460D] animate-spin mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A817C]">Loading Course Intelligence...</p>
      </div>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center border border-[#EAE4DD] bg-white p-12">
        <h2 className="text-2xl font-bold mb-4 text-[#141314]">COULD NOT LOAD COURSE</h2>
        <p className="text-[#8A817C] text-[14px] mb-8">{error || 'Course not found in our records.'}</p>
        <Button onClick={() => navigate('/courses')}>BACK TO COURSES</Button>
      </div>
    </div>
  );

  const lessons = course.lessons || [];

  return (
    <div className="bg-[#F5F0EB] min-h-screen pb-32">
      {/* Hero Block */}
      <div className="w-full bg-[#FFFFFF] border-b border-[#EAE4DD]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
          <div className="w-full md:w-[40%] min-h-[300px] border-r border-[#EAE4DD] bg-[#F5F0EB] relative flex items-center justify-center overflow-hidden">
             {course.imageUrl ? (
               <img 
                 src={`http://localhost:3000${course.imageUrl}`} 
                 alt={course.title} 
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="text-[80px] font-black text-[#FB460D]/10 select-none">NOVA</div>
             )}
          </div>
          <div className="w-full md:w-[60%] p-12 lg:p-16 flex flex-col justify-center">
            <div className="flex space-x-2 mb-6 flex-wrap gap-y-2">
              {course.tags && course.tags.map(tag => (
                <span key={tag} className="border border-[#FB460D]/40 text-[#FB460D] text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1">{tag}</span>
              ))}
              {!course.tags?.length && <span className="border border-[#FB460D]/40 text-[#FB460D] text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1">COURSE</span>}
            </div>
            <h1 className="text-[40px] font-bold text-[#141314] leading-tight mb-4 tracking-[-0.02em]">
              {course.title}
            </h1>
            <p className="text-[#8A817C] text-[16px] max-w-xl mb-8 leading-relaxed">
              {course.description || "Dive deep into component architecture, state management patterns, and performance optimizations. This course distills hundreds of hours of production experience into an actionable learning path."}
            </p>
            <div className="flex items-center space-x-6 text-[12px] uppercase font-bold text-[#8A817C] tracking-widest border-t border-[#EAE4DD] pt-6 flex-wrap gap-y-4">
              <span>{course.lessonsCount || 0} LESSONS</span>
              <span>{course.duration || 'TBD'} TOTAL</span>
              <span>{course.views || 0} VIEWS</span>
              {course.instructor && <span className="text-[#FB460D]">BY {course.instructor.username}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 px-8">
        
        <div className="mb-12 border border-[#EAE4DD] bg-[#FFFFFF] p-8 flex items-center justify-between">
          <div className="flex-1 mr-12">
            <div className="flex justify-between text-[11px] font-bold tracking-widest text-[#8A817C] uppercase mb-3">
              <span>Overall Progress</span>
              <span className="text-[#FB460D]">0%</span>
            </div>
            <div className="w-full h-[4px] bg-[#EAE4DD]">
              <div className="h-full bg-[#FB460D] w-[0%]"></div>
            </div>
          </div>
          <div>
            <Button onClick={() => lessons.length > 0 ? navigate(`/courses/${course.id}/lesson/${lessons[0].id}`) : null} disabled={lessons.length === 0}>
              {lessons.length > 0 ? "START LEARNING" : "NO LESSONS YET"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-8" ref={tabsRef}>
          <div className="flex space-x-12 border-b border-[#EAE4DD] pb-4">
            {['OVERVIEW', 'RATINGS'].map(tab => (
              <button 
                key={tab}
                ref={tab === 'OVERVIEW' ? initTabRef : null}
                onClick={(e) => handleTabClick(tab, e)}
                className={`text-[11px] uppercase tracking-widest font-bold interactive ${activeTab === tab ? 'text-[#141314]' : 'text-[#8A817C]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D]"></div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-0 border border-[#EAE4DD] border-b-0 bg-[#FFFFFF]">
            {lessons.length > 0 ? lessons.map((lesson, idx) => (
              <div 
                key={lesson.id}
                onClick={() => navigate(`/courses/${course.id}/lesson/${lesson.id}`)}
                className="flex items-center justify-between p-6 border-b border-[#EAE4DD] interactive cursor-pointer hover:bg-[#F0EBE6] transition-colors group"
              >
                <div className="flex items-center space-x-6">
                  <div className="text-[12px] font-bold text-[#8A817C] font-mono group-hover:text-[#FB460D] transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#141314]">{lesson.title}</h3>
                    <p className="text-[10px] text-[#8A817C] font-bold tracking-widest uppercase mt-1">
                      {lesson.type}
                    </p>
                  </div>
                </div>
                
                <div>
                  {lesson.status === 'completed' && <CheckCircle2 size={24} className="text-[#10B981]" />}
                  {lesson.status === 'in-progress' && <div className="w-8 h-8 rounded-full border border-[#FB460D] flex items-center justify-center bg-[#FB460D]/10"><Play size={12} className="text-[#FB460D] ml-1" /></div>}
                  {lesson.status === 'not-started' && <Circle size={24} className="text-[#8A817C]" />}
                </div>
              </div>
            )) : (
              <div className="p-12 text-center border-b border-[#EAE4DD]">
                <p className="text-[12px] font-bold text-[#8A817C] uppercase tracking-widest">The curriculum is currently being architected.</p>
              </div>
            )}
          </div>
        )}

        {/* Ratings Tab Content */}
        {activeTab === 'RATINGS' && (
          <div ref={reviewsRef}>
            <div className="flex items-end justify-between mb-12">
              <div className="flex items-baseline space-x-4">
                <span className="text-[64px] font-[800] text-[#FB460D] leading-none tracking-tighter">4.8</span>
                <span className="text-[12px] font-bold text-[#8A817C] tracking-widest uppercase mb-2">OUT OF 5 · 120 REVIEWS</span>
              </div>
              <Button variant="ghost">ADD REVIEW +</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(r => (
                <div key={r} className="review-card bg-[#FFFFFF] border border-[#EAE4DD] p-6 hover:border-[#FB460D]/20 transition-colors">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FB460D]/20 text-[#FB460D] font-bold text-[12px] flex items-center justify-center">JD</div>
                    <div>
                      <p className="text-[13px] font-bold text-[#141314]">John Doe</p>
                      <div className="text-[#FB460D] text-[10px] mt-1">★ ★ ★ ★ ★</div>
                    </div>
                  </div>
                  <p className="text-[#8A817C] text-[14px] leading-relaxed">
                    "This course completely transformed the way I think about architecture. The brutalist design of this platform also makes the learning experience incredibly immersive."
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
