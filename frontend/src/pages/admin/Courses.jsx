import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { MOCK_COURSES } from '../../mockData';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { LayoutGrid, List, MoreVertical } from 'lucide-react';

export default function Courses() {
  const [courses] = useState(MOCK_COURSES);
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const containerRef = useRef(null);

  useEffect(() => {
    // Animate cards in
    if (view === 'kanban') {
      const cards = containerRef.current.querySelectorAll('.course-card');
      gsap.fromTo(cards, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    } else {
      const rows = containerRef.current.querySelectorAll('.course-row');
      gsap.fromTo(rows, 
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [view]);

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const drafts = filtered.filter(c => c.status === 'DRAFT');
  const published = filtered.filter(c => c.status === 'PUBLISHED');

  const CourseCard = ({ course }) => {
    const cardRef = useRef(null);
    const borderRef = useRef(null);

    const handleHover = (isHovering) => {
      if (isHovering) {
        gsap.to(cardRef.current, { y: -4, borderColor: 'rgba(251, 70, 13, 0.3)', duration: 0.3 });
        gsap.to(borderRef.current, { x: 0, duration: 0.3 });
      } else {
        gsap.to(cardRef.current, { y: 0, borderColor: '#EAE4DD', duration: 0.3 });
        gsap.to(borderRef.current, { x: '-100%', duration: 0.3 });
      }
    };

    return (
      <div 
        ref={cardRef}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        className="course-card relative bg-[#FFFFFF] border border-[#EAE4DD] rounded-none p-5 interactive cursor-pointer overflow-hidden mb-4"
        onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
      >
        <div ref={borderRef} className="absolute top-0 left-0 bottom-0 w-1 bg-[#FB460D] z-10" style={{ transform: 'translateX(-100%)' }}></div>
        
        <div className="h-32 mb-4 relative" style={{ background: 'linear-gradient(135deg, #FB460D22, #F5F0EB)' }}>
          <div className="absolute inset-0 bg-black/20"></div>
          {course.status === 'PUBLISHED' ? (
            <div className="absolute top-3 right-3 text-[10px] uppercase font-bold text-[#FB460D]">PUBLISHED</div>
          ) : (
            <div className="absolute top-3 right-3 text-[10px] uppercase font-bold text-[#8A817C]">DRAFT</div>
          )}
        </div>
        
        <h3 className="text-[16px] font-semibold text-[#141314] mb-2">{course.title}</h3>
        <div className="flex flex-wrap mb-4">
          <Badge variant="default" className="!text-[9px] mr-2">React</Badge>
          <Badge variant="default" className="!text-[9px]">Web</Badge>
        </div>
        
        <div className="text-[12px] text-[#8A817C] flex items-center justify-between border-t border-[#EAE4DD] pt-4">
          <div>{course.enrolled} Enrolled · {course.lessons} Lessons · {course.duration}</div>
          <button className="interactive hover:text-[#FB460D]" onClick={(e) => { e.stopPropagation(); }}>
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-12 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between mb-16 relative">
        <div className="relative">
          <h1 className="text-[48px] font-bold text-[#141314] tracking-[-0.03em] relative z-10 uppercase">
            COURSES
          </h1>
          <div className="absolute -top-10 -left-6 text-[180px] font-bold text-[#EAE4DD]/30 leading-none select-none z-0">
            01
          </div>
        </div>
        
        <div className="flex items-center space-x-6 z-10">
          <div className="w-64">
            <Input 
              placeholder="SEARCH COURSES..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex border border-[#EAE4DD]">
            <button 
              onClick={() => setView('kanban')}
              className={`p-3 interactive ${view === 'kanban' ? 'bg-[#EAE4DD] text-[#FB460D]' : 'text-[#8A817C] hover:text-[#141314]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-3 interactive border-l border-[#EAE4DD] ${view === 'list' ? 'bg-[#EAE4DD] text-[#FB460D]' : 'text-[#8A817C] hover:text-[#141314]'}`}
            >
              <List size={18} />
            </button>
          </div>
          <Button onClick={() => navigate('/admin/courses/new/edit')}>
            NEW COURSE +
          </Button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pb-20">
        {view === 'kanban' ? (
          <div className="flex space-x-8 h-full">
            {/* Draft Column */}
            <div className="flex-1 min-w-[320px] bg-[#F5F0EB] flex flex-col">
              <div className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest mb-6 border-b border-[#EAE4DD] pb-2">
                DRAFT ({drafts.length})
              </div>
              <div className="flex-1">
                {drafts.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
            
            {/* Published Column */}
            <div className="flex-1 min-w-[320px] bg-[#F5F0EB] flex flex-col">
              <div className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest mb-6 border-b border-[#EAE4DD] pb-2">
                PUBLISHED ({published.length})
              </div>
              <div className="flex-1">
                {published.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-6 gap-4 py-4 border-b border-[#EAE4DD] text-[10px] uppercase tracking-widest text-[#8A817C] font-bold">
              <div className="col-span-2">COURSE TITLE</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1">ENROLLED</div>
              <div className="col-span-1">LESSONS</div>
              <div className="col-span-1 text-right">ACTION</div>
            </div>
            {filtered.map(c => (
              <div key={c.id} className="course-row grid grid-cols-6 gap-4 py-6 border-b border-[#EAE4DD] items-center text-[13px] interactive hover:bg-[#FFFFFF] transition-colors cursor-pointer" onClick={() => navigate(`/admin/courses/${c.id}/edit`)}>
                <div className="col-span-2 font-semibold text-[#141314]">{c.title}</div>
                <div className="col-span-1">
                  <Badge variant={c.status === 'PUBLISHED' ? 'default' : 'muted'}>{c.status}</Badge>
                </div>
                <div className="col-span-1 text-[#8A817C]">{c.enrolled}</div>
                <div className="col-span-1 text-[#8A817C]">{c.lessons}</div>
                <div className="col-span-1 text-right">
                  <button className="interactive hover:text-[#FB460D]">Edit →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
