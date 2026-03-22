import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { api } from '../../api';
import { LayoutGrid, List, MoreVertical, X, Share2, Edit2, Plus } from 'lucide-react';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create Course Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const navigate = useNavigate();
  const containerRef = useRef(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/courses?page=${page}&limit=12`);
      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
      setTotalCourses(data.totalCourses || 0);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, page]);

  useEffect(() => {
    if (loading || courses.length === 0) return;
    
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
  }, [view, loading, courses.length]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    
    try {
      const newCourse = await api.post('/courses', { title: newCourseTitle });
      setIsCreateModalOpen(false);
      setNewCourseTitle('');
      // Navigate to the edit view or refresh list
      navigate(`/admin/courses/${newCourse.id}/edit`);
    } catch (err) {
      setCreateError(err.message || 'Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  const removeTag = async (courseId, tagToRemove) => {
    try {
      const course = courses.find(c => c.id === courseId);
      const newTags = course.tags.filter(t => t !== tagToRemove);
      
      // Optimistic update
      setCourses(courses.map(c => c.id === courseId ? { ...c, tags: newTags } : c));
      
      await api.put(`/courses/${courseId}`, { tags: newTags });
    } catch (err) {
      console.error("Failed to remove tag", err);
      fetchCourses(); // Revert on failure
    }
  };

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.tags && c.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  const [toast, setToast] = useState({ show: false, message: '' });

  const handleShare = (courseId) => {
    // Point to the learner view (CourseDetail)
    const url = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(url).then(() => {
      setToast({ show: true, message: 'Link copied to clipboard!' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    });
  };

  const CourseCard = ({ course }) => {
    const cardRef = useRef(null);

    const handleHover = (isHovering) => {
      if (isHovering) {
        gsap.to(cardRef.current, { y: -4, borderColor: '#FB460D', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', duration: 0.3 });
      } else {
        gsap.to(cardRef.current, { y: 0, borderColor: '#EAE4DD', boxShadow: 'none', duration: 0.3 });
      }
    };

    return (
      <div 
        ref={cardRef}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        className="course-card relative bg-[#FFFFFF] border border-[#EAE4DD] rounded-lg p-5 interactive mb-4 overflow-hidden"
      >
        {course.isPublished && (
          <div className="absolute -right-8 top-6 bg-green-600 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 z-10 shadow-sm uppercase tracking-wider">
            Published
          </div>
        )}

        {course.price > 0 && (
          <div className="absolute -left-8 top-6 bg-[#FB460D] text-white text-[10px] font-bold py-1 px-8 transform -rotate-45 z-10 shadow-sm tracking-wider">
            ₹{course.price}
          </div>
        )}

        {/* Course Cover Image */}
        <div className="h-32 -mx-5 -mt-5 mb-4 bg-[#F5F0EB] overflow-hidden border-b border-[#EAE4DD]">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl.startsWith('http') ? course.imageUrl : `http://localhost:3000${course.imageUrl}`} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FB460D]/10 to-[#F5F0EB]">
              <span className="text-[32px] font-black text-[#FB460D]/5 select-none">NOVA</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start mb-4 pr-6">
          <h3 className="text-[18px] font-bold text-[#141314] leading-tight w-3/4">{course.title}</h3>
          
          <div className="flex flex-col space-y-2">
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await api.put(`/courses/${course.id}`, { isPublished: !course.isPublished });
                  setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublished: !c.isPublished } : c));
                } catch (err) { console.error('Failed to toggle publish', err); }
              }}
              className={`px-3 py-1 text-[11px] font-medium border rounded-full transition-colors flex items-center justify-center ${
                course.isPublished 
                  ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white' 
                  : 'border-[#FB460D] text-[#FB460D] hover:bg-[#FB460D] hover:text-white'
              }`}
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button 
              onClick={() => handleShare(course.id)}
              className="px-3 py-1 text-[11px] font-medium border border-[#141314] rounded-full hover:bg-[#141314] hover:text-white transition-colors flex items-center justify-center"
            >
              Share
            </button>
            <button 
              onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
              className="px-3 py-1 text-[11px] font-medium border border-[#141314] rounded-full hover:bg-[#141314] hover:text-white transition-colors flex items-center justify-center"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 min-h-[24px]">
          {course.tags && course.tags.map((tag, idx) => (
            <div key={idx} className="flex items-center text-[10px] text-[#FB460D] border border-[#FB460D]/30 bg-[#FB460D]/5 rounded px-2 py-0.5">
              <span>{tag}</span>
              {(user.role === 'ADMIN') && (
                <button 
                  onClick={() => removeTag(course.id, tag)}
                  className="ml-1 hover:text-black focus:outline-none"
                  title="Remove tag"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 text-[12px] text-[#8A817C] font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-[#141314]/60 w-16">Views</span>
            <span className="text-[#FB460D] font-bold">{course.views || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[#141314]/60 w-16">Contents</span>
            <span className="text-[#FB460D] font-bold">{course.lessonsCount || 0}</span>
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <span className="text-[#141314]/60 w-16">Duration</span>
            <span className="text-[#FB460D] font-bold">{course.duration || '00:00'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-12 max-w-7xl mx-auto flex flex-col relative">
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
              placeholder="Search bar" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full"
            />
          </div>
          <div className="flex border border-[#EAE4DD] rounded-md overflow-hidden bg-white">
            <button 
              onClick={() => setView('kanban')}
              className={`p-2 interactive ${view === 'kanban' ? 'bg-[#141314] text-white' : 'text-[#8A817C] hover:text-[#141314]'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 interactive border-l border-[#EAE4DD] ${view === 'list' ? 'bg-[#141314] text-white' : 'text-[#8A817C] hover:text-[#141314]'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="pb-20 relative">
        {loading ? (
          <div className="flex justify-center items-center h-full text-[#8A817C]">Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center items-center h-full text-[#8A817C]">No courses found. Create one!</div>
        ) : view === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div className="w-full bg-white border border-[#EAE4DD] rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#EAE4DD] text-[11px] uppercase tracking-widest text-[#8A817C] font-bold bg-[#F5F0EB]/50">
              <div className="col-span-4">Course Title</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-1 text-center">Views</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Duration</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            {filtered.map(c => (
              <div key={c.id} className="course-row grid grid-cols-12 gap-4 p-4 border-b border-[#EAE4DD] items-center text-[13px] interactive hover:bg-[#F5F0EB]/30 transition-colors">
                <div className="col-span-4 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#F5F0EB] rounded overflow-hidden flex-shrink-0 border border-[#EAE4DD]">
                    {c.imageUrl ? (
                      <img src={c.imageUrl.startsWith('http') ? c.imageUrl : `http://localhost:3000${c.imageUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FB460D]/10">
                        <span className="text-[10px] font-bold text-[#FB460D]/20 uppercase">NOVA</span>
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-[#141314] truncate">{c.title}</div>
                </div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {c.tags && c.tags.slice(0, 2).map((t, i) => <span key={i} className="text-[9px] bg-[#EAE4DD] px-1.5 py-0.5 rounded">{t}</span>)}
                  {c.tags && c.tags.length > 2 && <span className="text-[9px] bg-[#EAE4DD] px-1.5 py-0.5 rounded">+{c.tags.length - 2}</span>}
                </div>
                <div className="col-span-1 text-center text-[#8A817C] font-medium">{c.views || 0}</div>
                <div className="col-span-1 text-center font-bold text-[#FB460D]">
                  {c.price > 0 ? `₹${c.price}` : 'Free'}
                </div>
                <div className="col-span-1 text-center text-[#8A817C] font-medium">{c.duration || '-'}</div>
                <div className="col-span-2 text-center">
                  {c.isPublished ? (
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold">PUB</span>
                  ) : (
                    <span className="text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-bold">DRF</span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end space-x-2">
                  <button onClick={() => handleShare(c.id)} className="text-[#8A817C] hover:text-[#FB460D]" title="Share Course"><Share2 size={16} /></button>
                  <button onClick={() => navigate(`/admin/courses/${c.id}/edit`)} className="text-[#8A817C] hover:text-[#FB460D]" title="Edit Course"><Edit2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12 bg-white/50 py-4 px-6 rounded-full inline-flex mx-auto border border-[#EAE4DD]">
            <Button 
              variant="ghost" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="!px-4 !py-2"
            >
              Previous
            </Button>
            <span className="text-[12px] font-bold text-[#8A817C]">
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] bg-[#141314] text-white px-6 py-3 rounded-none border border-[#FB460D] shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-2 h-2 bg-[#FB460D] rounded-full animate-pulse"></div>
          <span className="text-[12px] font-bold uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* Floating Create Button for UI from Figma */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="absolute bottom-12 left-12 w-16 h-16 bg-[#D8CEFF] border-2 border-[#141314] rounded-full flex items-center justify-center text-[#141314] interactive hover:scale-105 transition-transform z-20 shadow-[4px_4px_0px_#141314]"
      >
        <Plus size={32} />
      </button>

      {/* Create Course Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="p-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-white">Create Course</h2>
            <button onClick={() => setIsCreateModalOpen(false)} className="text-white/60 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleCreateCourse}>
            <div className="mb-6">
              <Input
                autoFocus
                placeholder="Provide a name.. (Eg: Basics of Odoo CRM)"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="w-full text-white bg-transparent border-white/20 focus:border-[#FB460D]"
                required
              />
            </div>
            {createError && <p className="text-red-500 text-sm mb-4">{createError}</p>}
            <Button 
              type="submit" 
              className="w-full justify-center"
              disabled={createLoading || !newCourseTitle.trim()}
            >
              {createLoading ? 'CREATING...' : 'CREATE COURSE'}
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
