import React, { useState, useEffect, useRef } from 'react';
import { X, Video, FileText, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Upload, Save, Clock, Download } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toggle from '../../components/Toggle';
import Modal from '../../components/Modal';
import { api } from '../../api';
import gsap from 'gsap';

export default function LessonModal({ isOpen, onClose, courseId, lesson, onSave }) {
  const [activeTab, setActiveTab] = useState('CONTENT');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'VIDEO',
    content: '',
    duration: '',
    allowDownload: false,
    description: '',
    responsible: '',
    attachments: []
  });

  const [lessonFile, setLessonFile] = useState(null);
  const [attachmentsToAdd, setAttachmentsToAdd] = useState([]);
  
  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        type: lesson.type || 'VIDEO',
        content: lesson.content || '',
        duration: lesson.duration || '',
        allowDownload: lesson.allowDownload || false,
        description: lesson.description || '',
        responsible: lesson.responsible || '',
        attachments: lesson.attachments || []
      });
    } else {
      setFormData({
        title: '',
        type: 'VIDEO',
        content: '',
        duration: '',
        allowDownload: false,
        description: '',
        responsible: '',
        attachments: []
      });
    }
    setActiveTab('CONTENT');
  }, [lesson, isOpen]);

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
    if (!formData.title.trim()) return;
    
    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('duration', formData.duration);
      data.append('allowDownload', formData.allowDownload);
      data.append('description', formData.description);
      data.append('responsible', formData.responsible);
      
      if (formData.type === 'VIDEO') {
        data.append('content', formData.content);
      } else if (lessonFile) {
        data.append('file', lessonFile);
      } else {
        data.append('content', formData.content);
      }

      let savedLesson;
      if (lesson?.id) {
        savedLesson = await api.upload(`/lessons/${lesson.id}`, data, 'PUT');
      } else {
        savedLesson = await api.upload(`/lessons/course/${courseId}`, data);
      }

      // Handle Attachments (Upload individually or as part of a batch if API supported)
      // For now, let's assume we just save the lesson. 
      // In a real app, you'd handle attachments too.
      
      onSave(savedLesson);
      onClose();
    } catch (err) {
      console.error("Failed to save lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAttachment = (type) => {
    const newAttach = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Attachment',
      type: type, // 'FILE' or 'LINK'
      url: '',
      isNew: true
    };
    setFormData({ ...formData, attachments: [...formData.attachments, newAttach] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE4DD]">
        <h2 className="text-[18px] font-bold text-[#141314] uppercase tracking-wider">
          {lesson ? 'Edit Lesson' : 'Add New Lesson'}
        </h2>
        <button onClick={onClose} className="text-[#8A817C] hover:text-[#141314] transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="relative mb-8" ref={tabsRef}>
        <div className="flex space-x-10 border-b border-[#EAE4DD] pb-4">
          {['CONTENT', 'DESCRIPTION', 'ATTACHMENTS'].map(tab => (
            <button 
              key={tab}
              onClick={(e) => handleTabClick(tab, e)}
              className={`text-[11px] uppercase tracking-widest font-bold interactive transition-colors ${activeTab === tab ? 'text-[#FB460D]' : 'text-[#8A817C] hover:text-[#141314]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D] w-16"></div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'CONTENT' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input 
                label="LESSON TITLE" 
                placeholder="Introduction to..." 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-[#141314] border-[#EAE4DD]"
                required
              />
              <div className="flex flex-col">
                <label className="text-[10px] uppercase text-[#FB460D] tracking-widest mb-3 font-bold">LESSON TYPE</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'VIDEO', icon: <Video size={14} /> },
                    { id: 'DOCUMENT', icon: <FileText size={14} /> },
                    { id: 'IMAGE', icon: <ImageIcon size={14} /> }
                  ].map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 border text-[10px] font-bold tracking-widest uppercase transition-all ${formData.type === t.id ? 'border-[#FB460D] bg-[#FB460D]/10 text-[#FB460D]' : 'border-[#EAE4DD] text-[#8A817C] hover:border-[#8A817C]'}`}
                    >
                      {t.icon}
                      <span>{t.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.type === 'VIDEO' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="VIDEO URL (YOUTUBE / DRIVE)" 
                  placeholder="https://..." 
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="text-[#141314] border-[#EAE4DD]"
                />
                <div className="relative">
                  <Input 
                    label="DURATION (MM:SS)" 
                    placeholder="05:30" 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="text-[#141314] border-[#EAE4DD] pr-10"
                  />
                  <Clock size={16} className="absolute right-3 bottom-3 text-[#8A817C]" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-[#EAE4DD] flex flex-col items-center justify-center cursor-pointer hover:border-[#FB460D]/50 transition-colors group"
                >
                  <Upload size={24} className="text-[#8A817C] mb-2 group-hover:text-[#FB460D]" />
                  <span className="text-[9px] font-bold text-[#141314] uppercase tracking-widest">
                    {lessonFile ? lessonFile.name : `UPLOAD ${formData.type}`}
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => setLessonFile(e.target.files[0])}
                    className="hidden" 
                    accept={formData.type === 'IMAGE' ? "image/*" : ".pdf,.doc,.docx"}
                  />
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#EAE4DD] hover:border-[#FB460D]/30 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, allowDownload: !formData.allowDownload })}>
                    <div className="flex items-center space-x-3">
                      <Download size={18} className="text-[#FB460D]" />
                      <div>
                        <p className="text-[12px] font-bold text-[#141314] uppercase tracking-wider">Allow Download</p>
                        <p className="text-[10px] text-[#8A817C]">Learners can save this file.</p>
                      </div>
                    </div>
                    <Toggle checked={formData.allowDownload} onChange={(val) => setFormData({ ...formData, allowDownload: val })} />
                  </div>
                </div>
              </div>
            )}
            
            <Input 
              label="RESPONSIBLE (OPTIONAL)" 
              placeholder="e.g. Instructor Name" 
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              className="text-[#141314] border-[#EAE4DD]"
            />
          </div>
        )}

        {activeTab === 'DESCRIPTION' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <label className="text-[10px] uppercase text-[#FB460D] tracking-widest font-bold">Lesson Narrative</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-80 bg-transparent border border-[#EAE4DD] p-4 text-[#141314] text-[14px] outline-none focus:border-[#FB460D] transition-colors resize-none"
              placeholder="Describe what learners will achieve in this module..."
            />
          </div>
        )}

        {activeTab === 'ATTACHMENTS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[12px] font-bold text-[#141314] uppercase tracking-wider">Resources & Files</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" className="!py-1 !px-3 !text-[9px] !text-[#141314] bg-[#EAE4DD]/30" onClick={() => addAttachment('LINK')}>+ LINK</Button>
                <Button variant="ghost" className="!py-1 !px-3 !text-[9px] !text-[#141314] bg-[#EAE4DD]/30" onClick={() => addAttachment('FILE')}>+ FILE</Button>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {formData.attachments.map((attach) => (
                <div key={attach.id} className="flex items-center space-x-4 p-4 border border-[#EAE4DD] group hover:border-[#8A817C] transition-all">
                  {attach.type === 'FILE' ? <Upload size={16} className="text-[#FB460D]" /> : <LinkIcon size={16} className="text-[#FB460D]" />}
                  <input 
                    type="text" 
                    value={attach.title}
                    onChange={(e) => {
                      const newAtts = formData.attachments.map(a => a.id === attach.id ? { ...a, title: e.target.value } : a);
                      setFormData({ ...formData, attachments: newAtts });
                    }}
                    className="flex-1 bg-transparent border-none text-[13px] text-[#141314] outline-none"
                    placeholder="Attachment Title"
                  />
                  <input 
                    type="text" 
                    value={attach.url}
                    onChange={(e) => {
                      const newAtts = formData.attachments.map(a => a.id === attach.id ? { ...a, url: e.target.value } : a);
                      setFormData({ ...formData, attachments: newAtts });
                    }}
                    className="flex-1 bg-transparent border-none text-[11px] text-[#8A817C] outline-none italic"
                    placeholder={attach.type === 'FILE' ? "Upload file..." : "https://..."}
                  />
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, attachments: formData.attachments.filter(a => a.id !== attach.id) });
                    }}
                    className="text-[#8A817C]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.attachments.length === 0 && (
                <div className="text-center py-12 border border-dashed border-[#EAE4DD]">
                  <p className="text-[#8A817C] text-[11px]">No supplemental attachments architected.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-[#EAE4DD]">
        <Button variant="ghost" className="!text-[#141314] hover:!bg-[#EAE4DD]/30" onClick={onClose}>CANCEL</Button>
        <Button onClick={handleSave} disabled={loading || !formData.title.trim()} className="!px-8">
          {loading ? 'STORING...' : <><Save size={16} className="mr-2" /> SAVE MODULE</>}
        </Button>
      </div>
    </Modal>
  );
}
