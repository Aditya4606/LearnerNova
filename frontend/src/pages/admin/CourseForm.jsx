import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, GripVertical, FileText, Play, MoreVertical, Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toggle from '../../components/Toggle';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CONTENT');
  const [published, setPublished] = useState(false);
  const [lessonModal, setLessonModal] = useState(false);

  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);

  const handleTabClick = (tab, e) => {
    setActiveTab(tab);
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
    if (el && activeTab === 'CONTENT' && tabUnderlineRef.current?.style.width === '') {
      const rect = el.getBoundingClientRect();
      const parentRect = tabsRef.current.getBoundingClientRect();
      gsap.set(tabUnderlineRef.current, {
        x: rect.left - parentRect.left,
        width: rect.width
      });
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-[#141314] overflow-y-auto pb-32">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-[#141314]/90 backdrop-blur border-b border-[#2E2A2B] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-[#6B6460] hover:text-[#FB460D] interactive">
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            defaultValue={id === 'new' ? 'Untitled Course' : 'Advanced React Patterns'}
            className="bg-transparent border-none text-[18px] font-bold text-[#F5F0EB] outline-none"
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-r border-[#2E2A2B] pr-6">
            <span className="text-[10px] uppercase font-bold text-[#6B6460] tracking-widest text-right">
              {published ? 'PUBLISHED' : 'DRAFT'}
            </span>
            <Toggle checked={published} onChange={setPublished} />
          </div>
          <Button variant="ghost" className="!px-4 !py-2">PREVIEW</Button>
          <Button variant="ghost" className="!px-4 !py-2">ADD ATTENDEES</Button>
          <Button variant="ghost" className="!px-4 !py-2">CONTACT</Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-12">
        {/* Cover Image Upload */}
        <div className="border border-dashed border-[#2E2A2B] h-64 w-full mb-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#FB460D]/50 transition-colors interactive group bg-[#1C1A1B]">
          <div className="w-16 h-16 rounded-full bg-[#2E2A2B] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={24} className="text-[#F5F0EB]" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#6B6460] font-bold">DRAG & DROP COURSE COVER</p>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          <Input label="COURSE TITLE" placeholder="Enter title" defaultValue="Advanced React Patterns" />
          <Input label="TAGS" placeholder="Press enter to add tags" defaultValue="React, Web, Frontend" />
          <Input label="WEBSITE URL" placeholder="https://" />
          <div className="flex flex-col mb-4">
            <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-1">RESPONSIBLE</label>
            <select className="bg-transparent border-0 border-b border-[#2E2A2B] text-[#F5F0EB] text-[15px] px-0 py-3 w-full outline-none interactive appearance-none cursor-pointer">
              <option className="bg-[#1C1A1B]">John Instructor</option>
              <option className="bg-[#1C1A1B]">Admin Team</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-8" ref={tabsRef}>
          <div className="flex space-x-12 border-b border-[#2E2A2B] pb-4">
            {['CONTENT', 'DESCRIPTION', 'OPTIONS', 'QUIZ'].map(tab => (
              <button 
                key={tab}
                ref={tab === 'CONTENT' ? initTabRef : null}
                onClick={(e) => handleTabClick(tab, e)}
                className={`text-[11px] uppercase tracking-widest font-bold interactive ${activeTab === tab ? 'text-[#F5F0EB]' : 'text-[#6B6460]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D]"></div>
        </div>

        {/* Tab Content Areas */}
        {activeTab === 'CONTENT' && (
          <div className="space-y-0">
            {['Compound Components', 'Render Props', 'Custom Contexts'].map((lesson, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-[#2E2A2B] group hover:bg-[#1C1A1B] px-4 -mx-4 transition-colors">
                <GripVertical size={16} className="text-[#2E2A2B] cursor-move" />
                <div className="flex-1">
                  <p className="text-[14px] text-[#F5F0EB] font-semibold">{lesson}</p>
                </div>
                <Badge variant="default" className="!text-[9px]"><Play size={10} className="inline mr-1" /> VIDEO</Badge>
                <button className="text-[#6B6460] hover:text-[#FB460D] interactive ml-4">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
            
            <div className="mt-8 text-center">
              <Button variant="ghost" onClick={() => setLessonModal(true)}>+ ADD CONTENT</Button>
            </div>
          </div>
        )}

        {activeTab === 'OPTIONS' && (
          <div className="space-y-4">
            {['Require sequential learning', 'Drip content weekly', 'Publicly visible'].map((opt, i) => (
              <div key={i} className="p-6 border border-[#2E2A2B] bg-[#1C1A1B] flex items-center justify-between group hover:border-l-[#FB460D] hover:border-l-[4px] transition-all interactive cursor-pointer">
                <div>
                  <p className="text-[14px] font-semibold text-[#F5F0EB] mb-1">{opt}</p>
                  <p className="text-[11px] text-[#6B6460]">Enable this setting to apply specific routing.</p>
                </div>
                <Toggle checked={i === 0} onChange={() => {}} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'QUIZ' && (
          <div className="text-center pt-8">
            <Button onClick={() => navigate(`/admin/courses/${id}/quiz/1`)}>
              + ADD QUIZ
            </Button>
          </div>
        )}
      </div>

      <LessonModal isOpen={lessonModal} onClose={() => setLessonModal(false)} />
    </div>
  );
}

function LessonModal({ isOpen, onClose }) {
  const [download, setDownload] = useState(false);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2E2A2B]">
        <div className="flex space-x-8">
          {['CONTENT', 'DESCRIPTION', 'ATTACHMENTS'].map((t, i) => (
            <button key={t} className={`text-[10px] uppercase font-bold tracking-widest interactive ${i === 0 ? 'text-[#FB460D]' : 'text-[#6B6460] hover:text-[#F5F0EB]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <Input label="LESSON TITLE" placeholder="Enter lesson name" />
        
        <div>
          <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-3 block">LESSON TYPE</label>
          <div className="grid grid-cols-4 gap-4">
            {['VIDEO', 'TEXT', 'PDF', 'AICC'].map((type, i) => (
              <div key={type} className={`p-4 border text-center interactive cursor-pointer font-bold tracking-widest text-[10px] uppercase ${i === 0 ? 'border-[#FB460D] text-[#FB460D] bg-[#FB460D]/5' : 'border-[#2E2A2B] text-[#6B6460] hover:border-[#6B6460]'}`}>
                {type}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-[#2E2A2B] bg-[#141314]">
          <span className="text-[11px] font-bold text-[#F5F0EB] tracking-widest uppercase">ALLOW DOWNLOAD</span>
          <Toggle checked={download} onChange={setDownload} />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-12 pt-6 border-t border-[#2E2A2B]">
        <Button variant="ghost" onClick={onClose}>CANCEL</Button>
        <Button onClick={onClose}>SAVE CONTENT</Button>
      </div>
    </Modal>
  );
}
