import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, GripVertical, FileText, Play, MoreVertical, Plus, Save, Eye, Users, Mail, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toggle from '../../components/Toggle';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LessonModal from './LessonModal';
import { api } from '../../api';

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState({
    title: '',
    description: '',
    isPublished: false,
    website: '',
    imageUrl: '',
    price: 0,
    tags: [],
    createdBy: '',
    lessons: [],
    quizzes: [],
    visibility: 'everyone',
    accessRule: 'open'
  });
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('CONTENT');
  const [lessonModal, setLessonModal] = useState(false);
  const [attendeesModal, setAttendeesModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchCourse = async () => {
    try {
      const data = await api.get(`/courses/${id}`);
      setCourse(data);
    } catch (err) {
      console.error("Failed to refresh course", err);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchCourse();
    } catch (err) {
      console.error("Failed to delete lesson", err);
    }
  };

  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, usersData] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/users?role=INSTRUCTOR') // Assuming this endpoint exists or just getting all
        ]);
        setCourse(courseData);
        setInstructors(usersData || []);
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    };
    if (id !== 'new') fetchData();
    else setLoading(false);
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

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      // Only send scalar fields, not nested relations (lessons, quizzes, instructor)
      const { title, description, isPublished, website, imageUrl, price, tags, createdBy, views, duration, lessonsCount, visibility, accessRule } = course;
      await api.put(`/courses/${id}`, { title, description, isPublished, website, imageUrl, price, tags, createdBy, views, duration, lessonsCount, visibility, accessRule });
      showToast('Course saved successfully!');
    } catch (err) {
      console.error("Failed to save course", err);
      showToast(err.message || 'Failed to save course', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const togglePublish = async (val) => {
    setCourse({...course, isPublished: val});
    try {
      await api.put(`/courses/${id}`, { isPublished: val });
      showToast(val ? 'Course published successfully!' : 'Course unpublished successfully!');
    } catch (err) {
      console.error("Failed to toggle publish", err);
      showToast('Failed to toggle publish state', 'error');
      setCourse({...course, isPublished: !val}); // revert
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!course.tags.includes(newTag.trim())) {
        setCourse({ ...course, tags: [...course.tags, newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setCourse({ ...course, tags: course.tags.filter(t => t !== tag) });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploadLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const { imageUrl } = await api.upload('/upload', formData);
      setCourse({ ...course, imageUrl });
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setImageUploadLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#F5F0EB]">
      <div className="w-8 h-8 border-2 border-[#FB460D] border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col relative bg-[#F5F0EB] pb-32">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-[#F5F0EB]/90 backdrop-blur border-b border-[#EAE4DD] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/courses')} className="text-[#8A817C] hover:text-[#FB460D] interactive">
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            value={course.title}
            onChange={(e) => setCourse({...course, title: e.target.value})}
            className="bg-transparent border-none text-[18px] font-bold text-[#141314] outline-none w-64"
            placeholder="Course Title"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 border-r border-[#EAE4DD] pr-6">
            <span className="text-[10px] uppercase font-bold text-[#8A817C] tracking-widest text-right">
              {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
            </span>
            <Toggle checked={course.isPublished} onChange={togglePublish} />
          </div>
          <Button variant="ghost" className="!px-3 !py-1.5 !text-[10px]" onClick={() => window.open(`/courses/${id}`, '_blank')}>
            <Eye size={14} className="mr-2"/> PREVIEW
          </Button>
          <Button variant="ghost" className="!px-3 !py-1.5 !text-[10px]" onClick={() => setAttendeesModal(true)}>
            <Users size={14} className="mr-2"/> ATTENDEES
          </Button>
          <Button variant="ghost" className="!px-3 !py-1.5 !text-[10px]" onClick={() => setContactModal(true)}>
            <Mail size={14} className="mr-2"/> CONTACT
          </Button>
          <Button onClick={handleSave} disabled={saveLoading} className="!px-6">
            {saveLoading ? '...' : <><Save size={16} className="mr-2"/> SAVE</>}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="relative mb-8" ref={tabsRef}>
              <div className="flex space-x-10 border-b border-[#EAE4DD] pb-4">
                {['CONTENT', 'DESCRIPTION', 'OPTIONS', 'QUIZ'].map(tab => (
                  <button 
                    key={tab}
                    onClick={(e) => handleTabClick(tab, e)}
                    className={`text-[11px] uppercase tracking-widest font-bold interactive ${activeTab === tab ? 'text-[#141314]' : 'text-[#8A817C]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D] w-16"></div>
            </div>

            {/* Tab Content Areas */}
            <div className="bg-white border border-[#EAE4DD] p-8 shadow-sm">
              {activeTab === 'CONTENT' && (
                <div className="space-y-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[14px] font-bold text-[#141314] uppercase tracking-wider">Curriculum</h3>
                    <Button variant="ghost" className="!py-1 !px-3 !text-[10px]" onClick={() => setLessonModal(true)}>+ ADD LESSON</Button>
                  </div>
                  {course.lessons && course.lessons.length > 0 ? course.lessons.map((lesson, i) => (
                    <div key={lesson.id} className="flex items-center space-x-4 py-4 border-b border-[#EAE4DD] last:border-0 group hover:bg-[#F5F0EB]/30 px-4 -mx-4 transition-colors">
                      <GripVertical size={16} className="text-[#EAE4DD] cursor-move" />
                      <div className="flex-1">
                        <p className="text-[14px] text-[#141314] font-semibold">{lesson.title}</p>
                      </div>
                      <Badge variant="default" className="!text-[9px] uppercase">{lesson.type}</Badge>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedLesson(lesson); setLessonModal(true); }}
                          className="text-[10px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteLesson(lesson.id)}
                          className="text-[10px] font-bold text-[#8A817C] hover:text-red-500 uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center">
                      <p className="text-[#8A817C] text-[13px]">No lessons added yet. Begin architecting your course.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'DESCRIPTION' && (
                <div className="space-y-6">
                  <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold">Course Overview</label>
                  <textarea 
                    value={course.description || ''}
                    onChange={(e) => setCourse({...course, description: e.target.value})}
                    placeholder="Enter course description (markdown supported)..."
                    className="w-full min-h-[400px] bg-transparent border border-[#EAE4DD] p-4 text-[15px] outline-none focus:border-[#FB460D] transition-colors"
                  />
                </div>
              )}

              {activeTab === 'OPTIONS' && (
                <div className="space-y-8">
                  {/* Visibility */}
                  <div>
                    <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-4 block">Show Course To</label>
                    <div className="space-y-3">
                      {[
                        { value: 'everyone', label: 'Everyone', desc: 'Anyone can see the course listing' },
                        { value: 'signed_in', label: 'Signed In Users', desc: 'Only registered users can view this course' },
                      ].map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => setCourse({ ...course, visibility: opt.value })}
                          className={`p-5 border cursor-pointer transition-all flex items-center justify-between ${
                            course.visibility === opt.value
                              ? 'border-[#FB460D] bg-[#FB460D]/5'
                              : 'border-[#EAE4DD] hover:border-[#FB460D]/30'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-[#141314]">{opt.label}</p>
                            <p className="text-[11px] text-[#8A817C] mt-1">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            course.visibility === opt.value ? 'border-[#FB460D]' : 'border-[#8A817C]'
                          }`}>
                            {course.visibility === opt.value && <div className="w-2.5 h-2.5 bg-[#FB460D] rounded-full"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Access Rule */}
                  <div>
                    <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-4 block">Access Rule</label>
                    <div className="space-y-3">
                      {[
                        { value: 'open', label: 'Open', desc: 'Anyone can start learning this course' },
                        { value: 'invitation', label: 'On Invitation', desc: 'Only invited learners can access the course' },
                        { value: 'payment', label: 'On Payment', desc: 'Learners must pay to access this course' },
                      ].map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => setCourse({ ...course, accessRule: opt.value })}
                          className={`p-5 border cursor-pointer transition-all flex items-center justify-between ${
                            course.accessRule === opt.value
                              ? 'border-[#FB460D] bg-[#FB460D]/5'
                              : 'border-[#EAE4DD] hover:border-[#FB460D]/30'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-[#141314]">{opt.label}</p>
                            <p className="text-[11px] text-[#8A817C] mt-1">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            course.accessRule === opt.value ? 'border-[#FB460D]' : 'border-[#8A817C]'
                          }`}>
                            {course.accessRule === opt.value && <div className="w-2.5 h-2.5 bg-[#FB460D] rounded-full"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price field - Only when payment selected */}
                  {course.accessRule === 'payment' && (
                    <div className="p-6 border border-[#FB460D]/30 bg-[#FB460D]/5">
                      <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-3 block">Course Price (₹)</label>
                      <input
                        type="number"
                        value={course.price || 0}
                        onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-transparent border-b-2 border-[#141314] py-3 text-[24px] font-bold text-[#141314] outline-none focus:border-[#FB460D] transition-colors"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  )}

                  {/* Course Admin */}
                  <div>
                    <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-4 block">Course Admin / Responsible</label>
                    <select
                      value={course.createdBy}
                      onChange={(e) => setCourse({ ...course, createdBy: e.target.value })}
                      className="w-full bg-[#F5F0EB] text-[#141314] border-b-2 border-[#141314] py-3 px-0 focus:outline-none focus:border-[#FB460D] transition-colors text-[14px] uppercase tracking-widest font-bold cursor-pointer"
                    >
                      {instructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.username} ({inst.role})</option>
                      ))}
                      {!instructors.some(i => i.id === course.createdBy) && <option value={course.createdBy}>Current Admin</option>}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'QUIZ' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[14px] font-bold text-[#141314] uppercase tracking-wider">Assessments</h3>
                    <Button variant="ghost" className="!py-1 !px-3 !text-[10px]" onClick={async () => {
                      try {
                        const quiz = await api.post('/quizzes', { title: `Quiz ${(course.quizzes?.length || 0) + 1}`, courseId: id });
                        setCourse({ ...course, quizzes: [...(course.quizzes || []), quiz] });
                      } catch (err) { console.error(err); }
                    }}>+ ADD QUIZ</Button>
                  </div>
                  {course.quizzes && course.quizzes.length > 0 ? course.quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center space-x-4 py-4 border-b border-[#EAE4DD] last:border-0 group hover:bg-[#F5F0EB]/30 px-4 -mx-4 transition-colors">
                      <FileText size={18} className="text-[#FB460D]" />
                      <div className="flex-1">
                        <p className="text-[14px] text-[#141314] font-semibold">{quiz.title}</p>
                        <p className="text-[11px] text-[#8A817C]">{quiz.questions?.length || 0} questions</p>
                      </div>
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/courses/${id}/quiz/${quiz.id}`)}
                          className="text-[10px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (!window.confirm('Delete this quiz and all its questions?')) return;
                            try {
                              await api.delete(`/quizzes/${quiz.id}`);
                              setCourse(prev => ({ ...prev, quizzes: prev.quizzes.filter(q => q.id !== quiz.id) }));
                            } catch (err) { console.error(err); }
                          }}
                          className="text-[10px] font-bold text-[#8A817C] hover:text-red-500 uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center">
                      <p className="text-[#8A817C] text-[13px]">No quizzes created yet. Add a quiz to assess your learners.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Metadata */}
          <div className="space-y-8">
            <div className="bg-white border border-[#EAE4DD] p-8 shadow-sm">
              <h4 className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-6">Metadata</h4>
              
              <div className="space-y-6">
                {/* Course Cover Image */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video bg-[#F5F0EB] border border-dashed border-[#EAE4DD] flex flex-col items-center justify-center cursor-pointer group hover:border-[#FB460D]/50 relative overflow-hidden"
                >
                  {imageUploadLoading ? (
                    <div className="w-6 h-6 border-2 border-[#FB460D] border-t-transparent animate-spin"></div>
                  ) : course.imageUrl ? (
                    <>
                      <img src={course.imageUrl.startsWith('http') ? course.imageUrl : `http://localhost:3000${course.imageUrl}`} alt="Course Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <ImageIcon size={24} className="text-white mb-2" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">CHANGE COVER</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-[#8A817C] mb-2 group-hover:text-[#FB460D]" />
                      <span className="text-[9px] font-bold text-[#8A817C] uppercase tracking-widest">UPLOAD COVER IMAGE</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <Input 
                  label="WEBSITE URL" 
                  placeholder="https://learnova.com/..." 
                  value={course.website || ''}
                  onChange={(e) => setCourse({...course, website: e.target.value})}
                  required={course.isPublished}
                />

                <Input 
                  label="COURSE PRICE (₹)" 
                  type="number"
                  placeholder="0" 
                  value={course.price || 0}
                  onChange={(e) => setCourse({...course, price: parseFloat(e.target.value) || 0})}
                  required={course.isPublished}
                />

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-2 font-bold">COURSE ADMIN</label>
                  <select 
                    value={course.createdBy}
                    onChange={(e) => setCourse({...course, createdBy: e.target.value})}
                    className="bg-transparent border-b border-[#EAE4DD] py-2 text-[14px] outline-none"
                  >
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.username} ({inst.role})</option>
                    ))}
                    {!instructors.some(i => i.id === course.createdBy) && <option value={course.createdBy}>Current Instructor</option>}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-2 font-bold">TAGS</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags.map(tag => (
                      <span key={tag} className="flex items-center text-[10px] font-bold bg-[#FB460D]/10 text-[#FB460D] px-2 py-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-black">×</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text"
                    placeholder="Add tag and press enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="bg-transparent border-b border-[#EAE4DD] py-2 text-[13px] outline-none placeholder:text-[#8A817C]/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#141314] p-8 text-white">
              <h4 className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">Enrollments</span>
                  <span className="text-[14px] font-bold">1,240</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">Views</span>
                  <span className="text-[14px] font-bold">{course.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest">Last Update</span>
                  <span className="text-[14px] font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LessonModal 
        isOpen={lessonModal} 
        onClose={() => { setLessonModal(false); setSelectedLesson(null); }} 
        courseId={id} 
        lesson={selectedLesson}
        onSave={() => fetchCourse()} 
      />
      <AttendeesModal isOpen={attendeesModal} onClose={() => setAttendeesModal(false)} courseId={id} />
      <ContactModal isOpen={contactModal} onClose={() => setContactModal(false)} courseId={id} />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] text-white px-6 py-3 rounded-none border shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'error' ? 'bg-red-600 border-red-500' : 'bg-[#141314] border-[#FB460D]'}`}>
          {toast.type === 'success' && <div className="w-2 h-2 bg-[#FB460D] rounded-full animate-pulse"></div>}
          <span className="text-[12px] font-bold uppercase tracking-widest">{toast.message}</span>
        </div>
      )}
    </div>
  );
}


function AttendeesModal({ isOpen, onClose, courseId }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim() || !email.includes('@')) return;
    try {
      setLoading(true);
      // Mock API call for inviting attendees
      // await api.post(`/courses/${courseId}/attendees`, { email });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      onClose();
      setEmail('');
    } catch (err) {
      console.error("Failed to invite attendee:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE4DD]">
        <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">Add Attendees</h2>
      </div>
      <div className="space-y-6 text-white">
        <p className="text-[13px] text-white/70">Invite learners to access this course directly via their email address.</p>
        <Input 
          label="LEARNER EMAIL" 
          placeholder="learner@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-white border-white/20"
        />
      </div>
      <div className="flex justify-end space-x-4 mt-12 pt-6 border-t border-white/10">
        <Button variant="ghost" className="!text-white hover:!bg-white/10" onClick={onClose}>CANCEL</Button>
        <Button onClick={handleInvite} disabled={loading || !email.trim() || !email.includes('@')}>
          {loading ? 'SENDING...' : 'SEND INVITATION'}
        </Button>
      </div>
    </Modal>
  );
}

function ContactModal({ isOpen, onClose, courseId }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      setLoading(true);
      // Mock API call for contacting attendees
      // await api.post(`/courses/${courseId}/contact`, { subject, message });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      onClose();
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE4DD]">
        <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">Contact Attendees</h2>
      </div>
      <div className="space-y-6 text-white">
        <p className="text-[13px] text-white/70">Send an email announcement to all learners enrolled in this course.</p>
        <Input 
          label="SUBJECT" 
          placeholder="e.g. Course Update: New Video Added!" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-white border-white/20"
        />
        <div>
          <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-3 block font-bold">MESSAGE</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement here..."
            className="w-full h-32 bg-transparent border border-white/20 p-4 text-[13px] outline-none focus:border-[#FB460D] transition-colors text-white resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-12 pt-6 border-t border-white/10">
        <Button variant="ghost" className="!text-white hover:!bg-white/10" onClick={onClose}>CANCEL</Button>
        <Button onClick={handleSend} disabled={loading || !subject.trim() || !message.trim()}>
          {loading ? 'SENDING...' : 'SEND ANNOUNCEMENT'}
        </Button>
      </div>
    </Modal>
  );
}
