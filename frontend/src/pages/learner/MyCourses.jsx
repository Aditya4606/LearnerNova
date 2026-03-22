import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Marquee from '../../components/Marquee';
import { Trophy, Star, Shield, Medal, Award, Search } from 'lucide-react';

const MILESTONES = [
  { icon: <Star size={14}/>,   name: 'Newbie',     pts: 20 },
  { icon: <Shield size={14}/>, name: 'Explorer',   pts: 40 },
  { icon: <Medal size={14}/>,  name: 'Achiever',   pts: 60 },
  { icon: <Award size={14}/>,  name: 'Specialist', pts: 80 },
  { icon: <Trophy size={14}/>, name: 'Expert',     pts: 100 },
  { icon: <Trophy size={14}/>, name: 'Master',     pts: 120 },
];

function getRankForPoints(points) {
  let rank = 'Newbie';
  for (const m of MILESTONES) {
    if (points >= m.pts) rank = m.name;
  }
  return rank;
}

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const pointsRef = useRef(null);

  const fetchCourses = async (searchTerm = '', currentPage = 1) => {
    try {
      const queryParams = new URLSearchParams({ page: currentPage, limit: 12 });
      if (searchTerm) queryParams.set('search', searchTerm);
      
      const data = await api.get(`/learner/courses?${queryParams.toString()}`);
      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  // Fetch user enrollments
  const fetchEnrollments = async () => {
    if (!user) return;
    try {
      const data = await api.get('/learner/enrollments');
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(search, page), fetchEnrollments()]);
      setLoading(false);
    };
    load();
  }, [user]);

  // Debounced search and page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchCourses(search, page).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  // GSAP animations
  useEffect(() => {
    if (loading) return;

    if (heroRef.current) {
      const chars = heroRef.current.querySelectorAll('.char');
      gsap.fromTo(chars,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: 'power3.out', delay: 0.2 }
      );
    }

    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
        );
      }
    }

    if (pointsRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: totalPoints,
        duration: 2,
        ease: 'power3.out',
        delay: 0.5,
        onUpdate: () => {
          if (pointsRef.current) pointsRef.current.innerText = Math.floor(obj.val).toLocaleString();
        },
      });
    }
  }, [loading]);

  // Build enrollment lookup: courseId -> enrollment
  const enrollmentMap = {};
  enrollments.forEach((e) => {
    enrollmentMap[e.courseId] = e;
  });

  // Calculate total points (mock: 20 pts per enrollment + progress bonus)
  const totalPoints = enrollments.reduce((acc, e) => acc + Math.floor(e.progress * 0.2) + 20, 0);

  // Profile helpers
  const displayName = user?.username || user?.name || '';
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'LR';

  const currentRank = getRankForPoints(totalPoints);

  const splitText = 'MY COURSES'.split('').map((char, i) => (
    <span key={i} className="char inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  // Enroll handler
  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/learner/enroll/${courseId}`, {});
      await fetchEnrollments();
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FB460D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EB] min-h-screen pb-32">
      {/* Hero Section */}
      <div className="w-full py-20 px-8 max-w-7xl mx-auto border-b border-[#EAE4DD]">
        <h1
          ref={heroRef}
          className="text-[72px] font-[800] text-[#141314] tracking-[-0.04em] leading-tight flex flex-wrap overflow-hidden"
        >
          {splitText}
        </h1>
        <p className="text-[#8A817C] mt-4 text-[18px] max-w-2xl font-medium">
          All published and enrolled courses. Master new skills, earn points, and unlock achievements.
        </p>
      </div>

      <Marquee text="LEARNOVA · LEARN · GROW · ACHIEVE · BUILD · " />

      {/* Main Two Column Layout */}
      <div className="max-w-7xl mx-auto px-8 pt-16 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Courses */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-12 max-w-md relative">
            <Input
              placeholder="SEARCH COURSES BY NAME..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
            />
            <Search
              size={16}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8A817C] pointer-events-none"
            />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollmentMap[course.id]}
                user={user}
                navigate={navigate}
                onEnroll={handleEnroll}
              />
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-[#8A817C] text-[14px]">No courses found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12 bg-[#FFFFFF] py-4 px-6 rounded-none border border-[#EAE4DD]">
              <Button 
                variant="ghost" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="!px-4 !py-2"
              >
                Previous
              </Button>
              <span className="text-[12px] font-bold text-[#8A817C] uppercase tracking-widest">
                Page <span className="text-[#141314]">{page}</span> of {totalPages}
              </span>
              <Button 
                variant="ghost" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="!px-4 !py-2"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Profile Panel */}
        {user && (
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-[#FFFFFF] border border-[#EAE4DD] p-8 sticky top-28">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-[#FB460D] text-white flex items-center justify-center text-[20px] font-bold">
                  {initials}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#141314]">{displayName}</h3>
                  <Badge variant="default" className="mt-1">
                    {user?.role || 'LEARNER'}
                  </Badge>
                </div>
              </div>

              <div className="w-full h-[1px] bg-[#EAE4DD] mb-8"></div>

              {/* Total Points */}
              <div className="mb-10 text-center">
                <p className="text-[10px] uppercase text-[#8A817C] tracking-widest font-bold mb-2">
                  TOTAL POINTS
                </p>
                <p ref={pointsRef} className="text-[56px] font-bold text-[#FB460D] leading-none">
                  0
                </p>
              </div>

              {/* Current Rank */}
              <div className="mb-8 p-4 border border-[#EAE4DD] bg-[#F5F0EB] flex items-center space-x-4">
                <Trophy size={24} className="text-[#FB460D]" />
                <div>
                  <p className="text-[10px] uppercase text-[#8A817C] tracking-widest font-bold">
                    CURRENT RANK
                  </p>
                  <p className="text-[14px] font-bold text-[#141314] uppercase">{currentRank}</p>
                </div>
              </div>

              {/* Milestones / Badges */}
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase text-[#8A817C] tracking-widest font-bold mb-4">
                  BADGES
                </h4>
                {MILESTONES.map((m) => (
                  <BadgeRow
                    key={m.name}
                    icon={m.icon}
                    name={m.name}
                    pts={m.pts}
                    earned={totalPoints >= m.pts}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, enrollment, user, navigate, onEnroll }) {
  const cardRef = useRef(null);
  const borderRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Determine button state
  let btnState = 'join'; // join | start | continue | completed | buy
  if (!user) {
    btnState = 'join';
  } else if (enrollment) {
    if (enrollment.progress >= 100) btnState = 'completed';
    else if (enrollment.progress > 0) btnState = 'continue';
    else btnState = 'start';
  } else {
    btnState = course.price > 0 ? 'buy' : 'start';
  }

  const handleHover = (isHovering) => {
    if (isHovering) {
      gsap.to(cardRef.current, { y: -6, duration: 0.3, ease: 'power2.out' });
      gsap.to(borderRef.current, { y: 0, duration: 0.3 });
    } else {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(borderRef.current, { y: '-100%', duration: 0.3 });
    }
  };

  const handleClick = (e) => {
    // Don't navigate if clicking a button
    if (e.target.closest('button')) return;
    navigate(`/courses/${course.id}`);
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (btnState === 'join') {
      navigate('/login');
    } else if (btnState === 'start' && !enrollment) {
      // Enroll first, then navigate
      onEnroll(course.id);
    } else if (btnState === 'start' || btnState === 'continue') {
      navigate(`/courses/${course.id}`);
    } else if (btnState === 'buy') {
      // For now, just enroll (payment not implemented)
      onEnroll(course.id);
    }
  };

  return (
    <div
      className="relative pt-[2px] overflow-hidden group interactive cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <div
        ref={borderRef}
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#FB460D] z-20"
        style={{ transform: 'translateY(-100%)' }}
      ></div>
      <div
        ref={cardRef}
        className="bg-[#FFFFFF] border border-[#EAE4DD] rounded-none p-5 h-full flex flex-col relative z-10 w-full transform mt-[4px]"
      >
        {/* Cover Image */}
        <div className="h-40 mb-6 bg-[#F5F0EB] border border-[#EAE4DD]/50 relative overflow-hidden">
          {course.imageUrl ? (
            <img
              src={course.imageUrl.startsWith('http') ? course.imageUrl : `${baseUrl}${course.imageUrl}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5F0EB] to-[#EAE4DD] flex items-center justify-center">
              <span className="text-[#8A817C] text-[24px] font-bold tracking-tighter opacity-10">
                NOVA
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-[#FB460D]/5 mix-blend-overlay"></div>

          {/* Price Badge */}
          {course.price > 0 && (
            <div className="absolute top-3 right-3 bg-[#FB460D] text-white text-[10px] font-bold px-3 py-1 tracking-wider uppercase">
              ₹{course.price}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[17px] font-semibold text-[#141314] mb-2 leading-tight">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[#8A817C] line-clamp-2 mb-4 flex-1">
          {course.description || 'Master the concepts required to build scalable modern applications.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-[22px]">
          {course.tags &&
            course.tags.map((tag) => (
              <Badge key={tag} variant="default" className="!text-[9px] uppercase tracking-wider">
                {tag}
              </Badge>
            ))}
          {(!course.tags || course.tags.length === 0) && (
            <Badge variant="default" className="!text-[9px] uppercase tracking-wider opacity-30">
              Course
            </Badge>
          )}
        </div>

        {/* Progress Bar (if enrolled and in progress) */}
        {enrollment && enrollment.progress > 0 && enrollment.progress < 100 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] uppercase text-[#8A817C] tracking-widest font-bold">
                Progress
              </span>
              <span className="text-[10px] font-bold text-[#FB460D]">{enrollment.progress}%</span>
            </div>
            <div className="h-1 bg-[#EAE4DD] w-full">
              <div
                className="h-full bg-[#FB460D] transition-all duration-500"
                style={{ width: `${enrollment.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          {btnState === 'join' && (
            <Button variant="ghost" className="w-full !py-3" onClick={handleAction}>
              Join Course →
            </Button>
          )}
          {btnState === 'start' && (
            <Button variant="primary" className="w-full !py-3" onClick={handleAction}>
              START LEARNING
            </Button>
          )}
          {btnState === 'continue' && (
            <Button variant="primary" className="w-full !py-3" onClick={handleAction}>
              ▶ CONTINUE
            </Button>
          )}
          {btnState === 'buy' && (
            <Button variant="primary" className="w-full !py-3" onClick={handleAction}>
              BUY COURSE — ₹{course.price}
            </Button>
          )}
          {btnState === 'completed' && (
            <Button
              variant="ghost"
              className="w-full !py-3 !text-[#10B981] !border-[#10B981]/30"
            >
              COMPLETED ✓
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeRow({ icon, name, pts, earned }) {
  return (
    <div
      className={`flex items-center justify-between transition-opacity ${
        earned ? 'opacity-100' : 'opacity-30'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center ${
            earned ? 'border-[#FB460D] text-[#FB460D]' : 'border-[#8A817C] text-[#8A817C]'
          }`}
        >
          {icon}
        </div>
        <p
          className={`text-[12px] font-bold uppercase tracking-widest ${
            earned ? 'text-[#141314]' : 'text-[#8A817C]'
          }`}
        >
          {name}
        </p>
      </div>
      <p className="text-[10px] font-bold text-[#8A817C] font-mono">{pts} PT</p>
    </div>
  );
}
