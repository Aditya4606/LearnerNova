import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../../api';
import { MOCK_COURSES } from '../../mockData';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Marquee from '../../components/Marquee';
import { Trophy, Star, Shield, Medal, Award } from 'lucide-react';

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const pointsRef = useRef(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.get('/courses');
      // For learners, only show published courses
      setCourses(data.filter(c => c.isPublished));
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    // Hero Text Stagger
    if (heroRef.current) {
      const chars = heroRef.current.querySelectorAll('.char');
      gsap.fromTo(chars,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: 'power3.out', delay: 0.2 }
      );
    }
    
    // Cards Stagger
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        );
      }
    }

    // Points Count Up
    if (pointsRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: 1250,
        duration: 2,
        ease: 'power3.out',
        delay: 0.5,
        onUpdate: () => {
          if (pointsRef.current) pointsRef.current.innerText = Math.floor(obj.val).toLocaleString();
        }
      });
    }
  }, [loading]);

  const splitText = "YOUR LEARNING JOURNEY".split('').map((char, i) => (
    <span key={i} className="char inline-block">{char === ' ' ? '\u00A0' : char}</span>
  ));

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.tags && c.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  // Profile Data Mock
  const displayName = user?.username || user?.name || '';
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LR';

  if (loading) return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FB460D] border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#F5F0EB] min-h-screen pb-32">
      {/* Hero Section */}
      <div className="w-full py-20 px-8 max-w-7xl mx-auto border-b border-[#EAE4DD]">
        <h1 ref={heroRef} className="text-[72px] font-[800] text-[#141314] tracking-[-0.04em] leading-tight flex flex-wrap overflow-hidden">
          {splitText}
        </h1>
        <p className="text-[#8A817C] mt-4 text-[18px] max-w-2xl font-medium">
          Master new skills, earn points, and unlock achievements. Consistency is your only shortcut.
        </p>
      </div>

      <Marquee text="LEARNOVA · LEARN · GROW · ACHIEVE · BUILD · " />

      {/* Main Two Column Layout */}
      <div className="max-w-7xl mx-auto px-8 pt-16 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Courses */}
        <div className="flex-1">
          <div className="mb-12 max-w-md">
            <Input 
              placeholder="SEARCH CATALOG OR ENROLLMENTS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} idx={i} navigate={navigate} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-[#8A817C] text-[14px]">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Panel */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-[#FFFFFF] border border-[#EAE4DD] p-8 sticky top-28">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#FB460D] text-white flex items-center justify-center text-[20px] font-bold">
                {initials}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#141314]">{user?.name}</h3>
                <Badge variant="default" className="mt-1">LEARNER</Badge>
              </div>
            </div>

            <div className="w-full h-[1px] bg-[#EAE4DD] mb-8"></div>

            <div className="mb-10 text-center">
              <p className="text-[10px] uppercase text-[#8A817C] tracking-widest font-bold mb-2">TOTAL POINTS</p>
              <p ref={pointsRef} className="text-[56px] font-bold text-[#FB460D] leading-none">
                0
              </p>
            </div>

            <div className="mb-8 p-4 border border-[#EAE4DD] bg-[#F5F0EB] flex items-center space-x-4">
              <Trophy size={24} className="text-[#FB460D]" />
              <div>
                <p className="text-[10px] uppercase text-[#8A817C] tracking-widest font-bold">CURRENT RANK</p>
                <p className="text-[14px] font-bold text-[#141314] uppercase">Gold Achiever</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] uppercase text-[#8A817C] tracking-widest font-bold mb-4">MILESTONES</h4>
              <BadgeRow icon={<Star size={14}/>} name="Newbie" pts="20" earned={true} />
              <BadgeRow icon={<Shield size={14}/>} name="Explorer" pts="40" earned={true} />
              <BadgeRow icon={<Medal size={14}/>} name="Achiever" pts="60" earned={true} />
              <BadgeRow icon={<Award size={14}/>} name="Specialist" pts="80" earned={false} />
              <BadgeRow icon={<Trophy size={14}/>} name="Master" pts="120" earned={false} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CourseCard({ course, navigate, idx }) {
  const cardRef = useRef(null);
  const borderRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Mock progress logic for UI presentation
  let progress = 0;
  let btnState = 'join'; // join | start | continue | completed
  
  if (idx === 0) { progress = 60; btnState = 'continue'; }
  else if (idx === 1) { progress = 0; btnState = 'start'; }
  else if (idx === 2) { progress = 100; btnState = 'completed'; }

  const handleHover = (isHovering) => {
    if (isHovering) {
      gsap.to(cardRef.current, { y: -6, duration: 0.3, ease: 'power2.out' });
      gsap.to(borderRef.current, { y: 0, duration: 0.3 });
    } else {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(borderRef.current, { y: '-100%', duration: 0.3 });
    }
  };

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <div className="relative pt-[2px] overflow-hidden group interactive cursor-pointer" onClick={handleClick} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
      <div ref={borderRef} className="absolute top-0 left-0 right-0 h-[2px] bg-[#FB460D] z-20" style={{ transform: 'translateY(-100%)' }}></div>
      <div ref={cardRef} className="bg-[#FFFFFF] border border-[#EAE4DD] rounded-none p-5 h-full flex flex-col relative z-10 w-full transform mt-[4px]">
        <div className="h-40 mb-6 bg-[#F5F0EB] border border-[#EAE4DD]/50 relative overflow-hidden">
          {course.imageUrl ? (
            <img 
              src={`${baseUrl}${course.imageUrl}`} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5F0EB] to-[#EAE4DD] flex items-center justify-center">
              <span className="text-[#8A817C] text-[24px] font-bold tracking-tighter opacity-10">NOVA</span>
            </div>
          )}
          <div className="absolute inset-0 bg-[#FB460D]/5 mix-blend-overlay"></div>
        </div>
        
        <h3 className="text-[17px] font-semibold text-[#141314] mb-2 leading-tight">{course.title}</h3>
        <p className="text-[13px] text-[#8A817C] line-clamp-2 mb-4 flex-1">
          {course.description || "Master the concepts required to build scalable modern web applications. Focus on architecture over syntax."}
        </p>

        <div className="flex flex-wrap gap-2 mb-6 min-h-[22px]">
          {course.tags && course.tags.map(tag => (
            <Badge key={tag} variant="default" className="!text-[9px] uppercase tracking-wider">{tag}</Badge>
          ))}
          {(!course.tags || course.tags.length === 0) && (
            <Badge variant="default" className="!text-[9px] uppercase tracking-wider opacity-30">Course</Badge>
          )}
        </div>

        {/* Action Button */}
        <div>
          {btnState === 'join' && <Button variant="ghost" className="w-full !py-3">Join Course →</Button>}
          {btnState === 'start' && <Button variant="primary" className="w-full !py-3">START LEARNING</Button>}
          {btnState === 'continue' && <Button variant="primary" className="w-full !py-3">▶ CONTINUE</Button>}
          {btnState === 'completed' && <Button variant="ghost" className="w-full !py-3 !text-[#10B981] !border-[#10B981]/30">COMPLETED ✓</Button>}
        </div>
      </div>
    </div>
  );
}

function BadgeRow({ icon, name, pts, earned }) {
  return (
    <div className={`flex items-center justify-between transition-opacity ${earned ? 'opacity-100' : 'opacity-30'}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center ${earned ? 'border-[#FB460D] text-[#FB460D]' : 'border-[#8A817C] text-[#8A817C]'}`}>
          {icon}
        </div>
        <p className={`text-[12px] font-bold uppercase tracking-widest ${earned ? 'text-[#141314]' : 'text-[#8A817C]'}`}>{name}</p>
      </div>
      <p className="text-[10px] font-bold text-[#8A817C] font-mono">{pts} PT</p>
    </div>
  );
}
