import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { CheckCircle2, Circle, Download, Link as LinkIcon, Play, Search, BookOpen, Clock } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const [courseData, reviewsData] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setCourse(courseData);
        setReviews(reviewsData);
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

  const handleSubmitReview = async () => {
    try {
      setSubmitError('');
      setIsSubmitting(true);
      const newReview = await api.post(`/reviews/${id}`, { 
        rating: reviewRating, 
        comment: reviewComment 
      });
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setReviewComment('');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
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
  const quizzes = course.quizzes || [];

  // Compute lesson stats
  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const inProgressLessons = lessons.filter(l => l.status === 'in-progress').length;
  const incompleteLessons = lessons.length - completedLessons;
  const progressPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  // Filter lessons by search
  const filteredLessons = searchQuery.trim()
    ? lessons.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : lessons;

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const hasReviewed = safeReviews.some(r => r.userId === user?.id);
  const averageRating = safeReviews.length > 0 
    ? (safeReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / safeReviews.length).toFixed(1)
    : '0.0';

  // Find first incomplete lesson to resume
  const resumeLesson = lessons.find(l => l.status === 'in-progress') || lessons.find(l => l.status !== 'completed') || lessons[0];

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
              <span>{course.lessonsCount || lessons.length} LESSONS</span>
              <span>{course.duration || 'TBD'} TOTAL</span>
              <span>{course.views || 0} VIEWS</span>
              {course.instructor && <span className="text-[#FB460D]">BY {course.instructor.username}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 px-8">
        
        {/* Progress & Stats Block */}
        <div className="mb-12 border border-[#EAE4DD] bg-[#FFFFFF] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-12">
              <div className="flex justify-between text-[11px] font-bold tracking-widest text-[#8A817C] uppercase mb-3">
                <span>Overall Progress</span>
                <span className="text-[#FB460D]">{progressPercent}%</span>
              </div>
              <div className="w-full h-[6px] bg-[#EAE4DD] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FB460D] to-[#FF7B54] rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <Button onClick={() => resumeLesson ? navigate(`/courses/${course.id}/lesson/${resumeLesson.id}`) : null} disabled={lessons.length === 0}>
                {completedLessons > 0 && completedLessons < lessons.length ? "CONTINUE LEARNING" : lessons.length > 0 ? "START LEARNING" : "NO LESSONS YET"}
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 border-t border-[#EAE4DD] pt-6">
            <div className="text-center border-r border-[#EAE4DD]">
              <p className="text-[24px] font-bold text-[#141314]">{lessons.length}</p>
              <p className="text-[9px] font-bold text-[#8A817C] uppercase tracking-widest mt-1">Total Lessons</p>
            </div>
            <div className="text-center border-r border-[#EAE4DD]">
              <p className="text-[24px] font-bold text-[#10B981]">{completedLessons}</p>
              <p className="text-[9px] font-bold text-[#8A817C] uppercase tracking-widest mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-[24px] font-bold text-[#FB460D]">{incompleteLessons}</p>
              <p className="text-[9px] font-bold text-[#8A817C] uppercase tracking-widest mt-1">Remaining</p>
            </div>
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
          <div className="space-y-0 border border-[#EAE4DD] bg-[#FFFFFF]">
            {/* Header with Search */}
            <div className="bg-[#F5F0EB]/30 p-4 border-b border-[#EAE4DD] flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-widest font-black text-[#8A817C]">Curriculum — {lessons.length} Modules</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A817C]" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="pl-9 pr-4 py-2 text-[12px] bg-white border border-[#EAE4DD] focus:border-[#FB460D] outline-none transition-colors w-56"
                />
              </div>
            </div>

            {filteredLessons.length > 0 ? filteredLessons.map((lesson, idx) => {
              const originalIdx = lessons.findIndex(l => l.id === lesson.id);
              return (
              <div key={lesson.id} className="border-b border-[#EAE4DD] last:border-0">
                <div 
                  onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                  className={`flex items-center justify-between p-6 interactive cursor-pointer hover:bg-[#F0EBE6] transition-colors group ${expandedLessonId === lesson.id ? 'bg-[#F0EBE6]' : ''}`}
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-[12px] font-bold text-[#8A817C] font-mono group-hover:text-[#FB460D] transition-colors">
                      {(originalIdx + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#141314]">{lesson.title}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-[10px] text-[#8A817C] font-bold tracking-widest uppercase">{lesson.type}</span>
                        {lesson.duration && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#EAE4DD]"></span>
                            <span className="text-[10px] text-[#8A817C] font-bold tracking-widest uppercase">{lesson.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {lesson.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest">Done</span>
                        <CheckCircle2 size={20} className="text-[#3B82F6]" />
                      </div>
                    )}
                    {lesson.status === 'in-progress' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-[#FB460D] uppercase tracking-widest">In Progress</span>
                        <div className="w-5 h-5 rounded-full border-2 border-[#FB460D] flex items-center justify-center">
                          <Play size={10} className="text-[#FB460D] ml-0.5" />
                        </div>
                      </div>
                    )}
                    {(!lesson.status || lesson.status === 'not-started') && (
                      <Circle size={20} className="text-[#EAE4DD]" />
                    )}
                  </div>
                </div>

                {expandedLessonId === lesson.id && (
                  <div className="p-8 bg-[#F5F0EB]/50 border-t border-[#EAE4DD] animate-in slide-in-from-top-2 duration-300">
                    {lesson.description && (
                      <div className="mb-8">
                        <h4 className="text-[10px] uppercase text-[#FB460D] tracking-[0.2em] font-bold mb-4">Lesson Overview</h4>
                        <p className="text-[14px] text-[#8A817C] leading-relaxed whitespace-pre-wrap">{lesson.description}</p>
                      </div>
                    )}

                    {lesson.attachments && lesson.attachments.length > 0 && (
                      <div>
                        <h4 className="text-[10px] uppercase text-[#FB460D] tracking-[0.2em] font-bold mb-4">Resources & Attachments</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lesson.attachments.map((attach) => (
                            <a 
                              key={attach.id} 
                              href={attach.url.startsWith('http') ? attach.url : `http://localhost:3000${attach.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-4 bg-white border border-[#EAE4DD] hover:border-[#FB460D]/30 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#FB460D]/10 text-[#FB460D] flex items-center justify-center mr-4 group-hover:bg-[#FB460D] group-hover:text-white transition-colors">
                                {attach.type === 'FILE' ? <Download size={14} /> : <LinkIcon size={14} />}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[12px] font-bold text-[#141314] truncate">{attach.title}</p>
                                <p className="text-[9px] text-[#8A817C] uppercase tracking-wider">{attach.type}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                      <Button variant="ghost" className="!text-[10px] !py-2" onClick={() => navigate(`/courses/${course.id}/lesson/${lesson.id}`)}>
                        <Play size={12} className="mr-2" /> ENTER MODULE
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              );
            }) : (
              <div className="p-12 text-center border-b border-[#EAE4DD]">
                <p className="text-[12px] font-bold text-[#8A817C] uppercase tracking-widest">
                  {searchQuery ? `No lessons matching "${searchQuery}"` : 'The curriculum is currently being architected.'}
                </p>
              </div>
            )}

            {/* Quizzes Section */}
            {quizzes.length > 0 && (
              <>
                <div className="bg-[#F5F0EB]/30 p-4 border-b border-[#EAE4DD] border-t border-[#EAE4DD]">
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-[#8A817C]">Knowledge Checks — {quizzes.length} Quizzes</h3>
                </div>
                {quizzes.map((quiz, idx) => (
                  <div key={quiz.id} className="border-b border-[#EAE4DD] last:border-b-0">
                    <div className="flex items-center justify-between p-6 hover:bg-[#F0EBE6] transition-colors group">
                      <div className="flex items-center space-x-6">
                        <div className="text-[12px] font-bold text-[#FB460D] font-mono">
                          Q{(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-[#141314]">{quiz.title}</h3>
                          <p className="text-[10px] text-[#8A817C] font-bold tracking-widest uppercase mt-1">
                            {quiz.questions?.length || 0} QUESTIONS · ASSESSMENT
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="!text-[10px] !py-2 border-[#141314]" onClick={() => navigate(`/courses/${course.id}/quiz/${quiz.id}`)}>
                        TAKE QUIZ
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Ratings Tab Content */}
        {activeTab === 'RATINGS' && (
          <div ref={reviewsRef}>
            <div className="flex items-end justify-between mb-12">
              <div className="flex items-baseline space-x-4">
                <span className="text-[64px] font-[800] text-[#FB460D] leading-none tracking-tighter">{averageRating}</span>
                <div>
                  <div className="flex space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-[16px] ${i < Math.round(parseFloat(averageRating)) ? 'text-[#FB460D]' : 'text-[#EAE4DD]'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-[12px] font-bold text-[#8A817C] tracking-widest uppercase">OUT OF 5 · {safeReviews.length} REVIEWS</span>
                </div>
              </div>
              {!hasReviewed && (
                <Button variant="ghost" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? 'CANCEL' : 'ADD REVIEW +'}
                </Button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-12 bg-white border border-[#EAE4DD] p-8 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-[14px] font-black text-[#141314] uppercase tracking-widest mb-6 border-b border-[#EAE4DD] pb-4">Write a Review</h3>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
                    {submitError}
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-[#8A817C] tracking-widest uppercase mb-3">Your Rating</label>
                  <div className="flex space-x-2">
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} 
                        onClick={() => setReviewRating(n)} 
                        className={`w-12 h-12 border-2 text-[18px] font-bold transition-all ${n <= reviewRating ? 'border-[#FB460D] bg-[#FB460D] text-white' : 'border-[#EAE4DD] text-[#8A817C] hover:border-[#FB460D]/40'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-[10px] font-bold text-[#8A817C] tracking-widest uppercase mb-2">Comment (Optional)</label>
                  <textarea 
                    value={reviewComment} 
                    onChange={e => setReviewComment(e.target.value)}
                    rows="3"
                    className="w-full border border-[#EAE4DD] p-3 text-[14px] bg-transparent focus:outline-none focus:border-[#FB460D] transition-colors resize-none"
                    placeholder="Share your experience with this course..."
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {safeReviews.map(r => (
                <div key={r.id} className="review-card bg-[#FFFFFF] border border-[#EAE4DD] p-8 hover:border-[#FB460D]/20 transition-colors">
                  <div className="flex items-center justify-between mb-4 border-b border-[#EAE4DD] pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-[#FB460D]/10 text-[#FB460D] font-bold text-[12px] flex items-center justify-center uppercase">
                        {(r.user?.username || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#141314]">{r.user?.username || 'Anonymous'}</p>
                        <div className="text-[#8A817C] text-[10px] mt-1 font-mono">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-[12px] ${i < r.rating ? 'text-[#FB460D]' : 'text-[#EAE4DD]'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-[#8A817C] text-[14px] leading-relaxed">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
              {safeReviews.length === 0 && (
                <div className="text-center py-12 border border-[#EAE4DD] bg-white">
                  <p className="text-[12px] font-bold text-[#8A817C] uppercase tracking-widest">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
