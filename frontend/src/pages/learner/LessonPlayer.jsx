import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, ChevronRight, FileText, Image as ImageIcon, Play, ExternalLink, CheckCircle2, Circle, Trophy, Star, Sparkles } from 'lucide-react';
import Button from '../../components/Button';
import { api } from '../../api';

export default function LessonPlayer() {
  const navigate = useNavigate();
  const { id: courseId, lid: lessonId } = useParams();
  const { course, lessons } = useOutletContext() || {};
  
  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [showBingo, setShowBingo] = useState(false);
  const contentRef = useRef(null);
  const bingoRef = useRef(null);

  useEffect(() => {
    if (lessons && lessonId) {
      const found = lessons.find(l => l.id === lessonId);
      setLesson(found || null);
      setIsCompleted(found?.status === 'completed');
    }
  }, [lessons, lessonId]);

  const handleMarkComplete = async () => {
    if (isCompleted || isMarking) return;
    try {
      setIsMarking(true);
      const result = await api.put(`/lessons/${lessonId}/complete`);
      setIsCompleted(true);
      // Update the lesson in the parent context
      if (lesson) lesson.status = 'completed';
      // Check if course is now 100% complete
      if (result.progress >= 100) {
        setShowBingo(true);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    } finally {
      setIsMarking(false);
    }
  };

  // Animate Bingo modal when it appears
  useEffect(() => {
    if (showBingo && bingoRef.current) {
      gsap.fromTo(bingoRef.current, 
        { scale: 0.5, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [showBingo]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.children, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [lesson?.id]);

  // Find current index for navigation
  const currentIdx = lessons ? lessons.findIndex(l => l.id === lessonId) : -1;
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < (lessons?.length || 0) - 1 ? lessons[currentIdx + 1] : null;

  const handleBack = () => navigate(`/courses/${courseId}`);
  const handlePrev = () => prevLesson && navigate(`/courses/${courseId}/lesson/${prevLesson.id}`);
  const handleNext = () => nextLesson && navigate(`/courses/${courseId}/lesson/${nextLesson.id}`);

  // Detect YouTube URL
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const params = new URLSearchParams(url.split('?')[1]);
      videoId = params.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Detect Vimeo URL
  const isVimeoUrl = (url) => {
    if (!url) return false;
    return url.includes('vimeo.com');
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  // Render content viewer based on lesson type
  const renderViewer = () => {
    if (!lesson) return null;
    const type = lesson.type?.toLowerCase();
    const content = lesson.content || '';

    if (type === 'video' || isYouTubeUrl(content) || isVimeoUrl(content)) {
      let embedUrl = content;
      if (isYouTubeUrl(content)) embedUrl = getYouTubeEmbedUrl(content);
      else if (isVimeoUrl(content)) embedUrl = getVimeoEmbedUrl(content);

      return (
        <div className="aspect-video w-full bg-black relative overflow-hidden shadow-2xl">
          <iframe
            src={embedUrl}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }

    if (type === 'image') {
      const imgSrc = content.startsWith('http') ? content : `http://localhost:3000${content}`;
      return (
        <div className="w-full flex items-center justify-center bg-[#141314] p-8 rounded shadow-2xl">
          <img 
            src={imgSrc} 
            alt={lesson.title} 
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    }

    if (type === 'document') {
      const docSrc = content.startsWith('http') ? content : `http://localhost:3000${content}`;
      if (content.endsWith('.pdf')) {
        return (
          <div className="w-full bg-white border border-[#EAE4DD] shadow-2xl" style={{ height: '70vh' }}>
            <iframe
              src={docSrc}
              title={lesson.title}
              className="w-full h-full"
            />
          </div>
        );
      }
      return (
        <div className="w-full bg-white border border-[#EAE4DD] p-12 shadow-lg text-center">
          <FileText size={48} className="mx-auto text-[#8A817C] mb-6" />
          <h3 className="text-[16px] font-bold text-[#141314] mb-4">{lesson.title}</h3>
          <a 
            href={docSrc} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center space-x-2 text-[#FB460D] text-[12px] font-bold uppercase tracking-widest hover:underline"
          >
            <span>Open Document</span>
            <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    // Default: show content as text or a placeholder
    return (
      <div className="w-full bg-white border border-[#EAE4DD] p-12 shadow-lg">
        <FileText size={48} className="mx-auto text-[#8A817C] mb-6" />
        <h3 className="text-[16px] font-bold text-[#141314] mb-4 text-center">{lesson.title}</h3>
        {content && (
          <div className="prose max-w-none text-[#555] text-[14px] leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    );
  };

  if (!lesson && lessons?.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0EB] p-8">
        <div className="text-center">
          <p className="text-[12px] font-bold text-[#8A817C] uppercase tracking-widest mb-4">Lesson not found</p>
          <Button onClick={handleBack}>BACK TO COURSE</Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F0EB]">
        <div className="w-8 h-8 border-2 border-[#EAE4DD] border-t-[#FB460D] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Bingo Celebration Modal */}
      {showBingo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div ref={bingoRef} className="bg-white border border-[#EAE4DD] shadow-2xl max-w-md w-full mx-4 p-10 text-center relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#FB460D]/10 to-transparent" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#FB460D]/10 to-transparent" />
            
            {/* Trophy Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FB460D] to-[#FF8C42] rounded-full flex items-center justify-center shadow-lg">
              <Trophy size={40} className="text-white" />
            </div>

            {/* Title */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles size={20} className="text-[#FB460D]" />
              <h2 className="text-[36px] font-black text-[#141314] tracking-tight">BINGO!</h2>
              <Sparkles size={20} className="text-[#FB460D]" />
            </div>
            <p className="text-[14px] text-[#8A817C] mb-8">You have earned</p>

            {/* Points Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#FB460D]/5 border border-[#FB460D]/30 px-6 py-3 mb-8">
              <Star size={20} className="text-[#FB460D] fill-[#FB460D]" />
              <span className="text-[28px] font-black text-[#FB460D]">20</span>
              <span className="text-[14px] font-bold text-[#FB460D] uppercase tracking-wider">Points</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#8A817C] mb-2">
                <span>5 Points</span>
                <span>100 Points</span>
              </div>
              <div className="w-full h-2 bg-[#F5F0EB] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FB460D] to-[#FF8C42] rounded-full transition-all duration-1000" style={{ width: '25%' }} />
              </div>
            </div>
            <p className="text-[11px] text-[#8A817C] mb-10">Reach the next rank to gain more points.</p>

            {/* Action Button */}
            <Button onClick={() => { setShowBingo(false); navigate(`/courses/${courseId}`); }} className="w-full !py-4 text-[13px] tracking-[0.1em]">
              CONTINUE COURSE →
            </Button>
          </div>
        </div>
      )}
      
      {/* Top Bar */}
      <div className="flex-shrink-0 h-[72px] bg-white border-b border-[#EAE4DD] px-8 flex items-center justify-between">
        <button 
          className="text-[11px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest interactive flex items-center transition-colors" 
          onClick={handleBack}
        >
          <ArrowLeft size={14} className="mr-2" /> BACK TO COURSE
        </button>
        <span className="text-[13px] font-bold text-[#141314] truncate max-w-md text-center">
          {lesson.title}
        </span>
        <div className="text-[10px] font-bold text-[#8A817C] tracking-widest uppercase">
          {currentIdx + 1}/{lessons?.length || 0}
        </div>
      </div>

      {/* Lesson Header */}
      <div className="p-8 bg-[#FAFAFA] flex-shrink-0 border-b border-[#EAE4DD]" ref={contentRef}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#FB460D] bg-[#FB460D]/5 px-3 py-1 border border-[#FB460D]/20">{lesson.type}</span>
            {lesson.duration && (
              <span className="text-[10px] text-[#8A817C] font-bold tracking-widest uppercase">{lesson.duration}</span>
            )}
          </div>
          <h2 className="text-[28px] font-bold text-[#141314] tracking-tight leading-tight mb-2">
            {lesson.title}
          </h2>
          {lesson.description && (
            <p className="text-[14px] text-[#8A817C] leading-relaxed max-w-2xl">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F5F0EB] flex flex-col items-center px-8 pt-8 pb-32">
        <div className="w-full max-w-4xl mx-auto">
          {renderViewer()}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-[#EAE4DD] flex items-center justify-between px-8 z-50">
        <Button 
          variant="ghost" 
          onClick={prevLesson ? handlePrev : handleBack}
          className="!text-[11px]"
        >
          ← {prevLesson ? 'PREVIOUS' : 'BACK'}
        </Button>

        {/* Mark as Complete */}
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted || isMarking}
          className={`flex items-center space-x-2 px-5 py-2.5 border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
            isCompleted
              ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6] cursor-default'
              : isMarking
                ? 'border-[#EAE4DD] text-[#8A817C] cursor-wait'
                : 'border-[#EAE4DD] text-[#8A817C] hover:border-[#3B82F6] hover:text-[#3B82F6] cursor-pointer'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 size={16} className="text-[#3B82F6]" />
          ) : (
            <Circle size={16} />
          )}
          <span>{isCompleted ? 'COMPLETED' : isMarking ? 'MARKING...' : 'MARK COMPLETE'}</span>
        </button>

        <Button 
          onClick={nextLesson ? handleNext : handleBack}
          className="!text-[11px]"
        >
          {nextLesson ? 'NEXT CONTENT →' : 'FINISH COURSE →'}
        </Button>
      </div>

    </div>
  );
}
