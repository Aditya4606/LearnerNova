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
  const [errorMsg, setErrorMsg] = useState('');
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
  const [attachmentFiles, setAttachmentFiles] = useState({});
  
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
    setErrorMsg('');
    if (!formData.title.trim()) {
      setErrorMsg('Lesson Title is required');
      return;
    }
    
    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('duration', formData.duration);
      data.append('allowDownload', formData.allowDownload);
      data.append('description', formData.description);
      data.append('responsible', formData.responsible);
      
      if (lessonFile) {
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

      // Handle Attachments
      const lessonIdToUse = savedLesson.id;

      // 1. Delete removed attachments
      if (lesson?.id) {
        const originalIds = new Set((lesson.attachments || []).map(a => a.id));
        const currentIds = new Set(formData.attachments.map(a => a.id));
        const deletedIds = [...originalIds].filter(id => !currentIds.has(id));
        for (const id of deletedIds) {
          try {
            await api.delete(`/lessons/attachments/${id}`);
          } catch (e) {
            console.error("Failed to delete attachment:", e);
          }
        }
      }

      // 2. Add new attachments
      const newAttachments = formData.attachments.filter(a => a.isNew);
      for (const a of newAttachments) {
        try {
          const attachData = new FormData();
          attachData.append('title', a.title || 'Untitled');
          attachData.append('type', a.type);
          
          if (a.type === 'FILE') {
            const file = attachmentFiles[a.id];
            if (file) {
              attachData.append('file', file);
            }
          } else {
            attachData.append('url', a.url);
          }
          
          await api.upload(`/lessons/${lessonIdToUse}/attachments`, attachData);
        } catch (e) {
          console.error("Failed to upload attachment:", e);
        }
      }
      
      // We should ideally fetch the updated lesson structure with attachments, but the list page normally refetches.
      onSave(savedLesson);
      onClose();
    } catch (err) {
      console.error("Failed to save lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAttachment = () => {
    const newAttach = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Attachment',
      type: 'LINK', // Default to link until a file is added
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 h-full border-2 border-dashed border-[#EAE4DD] flex flex-col items-center justify-center cursor-pointer hover:border-[#FB460D]/50 transition-colors group"
                >
                  <Upload size={24} className="text-[#8A817C] mb-2 group-hover:text-[#FB460D]" />
                  <span className="text-[9px] font-bold text-[#141314] uppercase tracking-widest text-center">
                    {lessonFile ? lessonFile.name : `UPLOAD ${formData.type}`}
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setLessonFile(file);
                      // Auto-detect type from MIME
                      const mime = file.type || '';
                      if (mime.startsWith('video/')) {
                        setFormData(prev => ({ ...prev, type: 'VIDEO' }));
                      } else if (mime.startsWith('image/')) {
                        setFormData(prev => ({ ...prev, type: 'IMAGE' }));
                      } else {
                        setFormData(prev => ({ ...prev, type: 'DOCUMENT' }));
                      }
                    }}
                    className="hidden" 
                    accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <Input 
                  label={`OR PASTE ${formData.type} URL`} 
                  placeholder="https://..." 
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="text-[#141314] border-[#EAE4DD]"
                />
                
                {formData.type === 'VIDEO' && (
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
                )}

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
                <Button variant="ghost" className="!py-1 !px-3 !text-[9px] !text-[#141314] bg-[#EAE4DD]/30" onClick={addAttachment}>+ ATTACHMENT</Button>
              </div>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {formData.attachments.map((attach) => (
                <div key={attach.id} className="flex flex-col space-y-2 p-4 border border-[#EAE4DD] group hover:border-[#8A817C] transition-all bg-[#FFFFFF]">
                  <div className="flex items-center space-x-4">
                    {attach.type === 'FILE' ? <Upload size={16} className="text-[#FB460D]" /> : <LinkIcon size={16} className="text-[#FB460D]" />}
                    <input 
                      type="text" 
                      value={attach.title}
                      onChange={(e) => {
                        const newAtts = formData.attachments.map(a => a.id === attach.id ? { ...a, title: e.target.value } : a);
                        setFormData({ ...formData, attachments: newAtts });
                      }}
                      className="flex-1 bg-transparent border-none text-[13px] font-bold text-[#141314] outline-none"
                      placeholder="Attachment Title"
                    />
                    <button 
                      onClick={() => {
                        setFormData({ ...formData, attachments: formData.attachments.filter(a => a.id !== attach.id) });
                        const newFiles = { ...attachmentFiles };
                        delete newFiles[attach.id];
                        setAttachmentFiles(newFiles);
                      }}
                      className="text-[#8A817C]/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {!attach.isNew && attach.type === 'LINK' ? (
                    <div className="flex items-center space-x-2 bg-[#F5F0EB] p-3">
                      <LinkIcon size={14} className="text-[#8A817C]" />
                      <span className="text-[11px] text-[#8A817C] truncate">{attach.url}</span>
                    </div>
                  ) : !attach.isNew && attach.type === 'FILE' ? (
                    <div className="flex items-center space-x-2 bg-[#F5F0EB] p-3">
                      <FileText size={14} className="text-[#8A817C]" />
                      <span className="text-[11px] text-[#8A817C] truncate">{attach.url || 'Existing File'}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div 
                        className={`relative border-2 border-dashed transition-colors p-4 flex flex-col items-center justify-center cursor-pointer ${
                          attach.type === 'FILE' ? 'border-[#FB460D]/50 bg-[#FB460D]/5' : 'border-[#EAE4DD] hover:border-[#FB460D]/50 bg-[#F5F0EB]/50'
                        }`}
                      >
                        <input 
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setAttachmentFiles({ ...attachmentFiles, [attach.id]: e.target.files[0] });
                              const newAtts = formData.attachments.map(a => a.id === attach.id ? { ...a, type: 'FILE' } : a);
                              setFormData({ ...formData, attachments: newAtts });
                            }
                          }}
                        />
                        <Upload size={20} className={`mb-2 ${attach.type === 'FILE' ? 'text-[#FB460D]' : 'text-[#8A817C]'}`} />
                        <span className="text-[10px] uppercase font-bold text-[#141314] tracking-widest text-center">
                          {attachmentFiles[attach.id] ? attachmentFiles[attach.id].name : 'DRAG & DROP OR BROWSE FILE'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] uppercase text-[#8A817C] font-bold tracking-widest mb-2 text-center md:text-left">OR PASTE LINK</span>
                        <input 
                          type="text" 
                          value={attach.url}
                          onChange={(e) => {
                            const newAtts = formData.attachments.map(a => a.id === attach.id ? { ...a, url: e.target.value, type: e.target.value ? 'LINK' : a.type } : a);
                            setFormData({ ...formData, attachments: newAtts });
                            if (e.target.value && attachmentFiles[attach.id]) {
                              const newFiles = { ...attachmentFiles };
                              delete newFiles[attach.id];
                              setAttachmentFiles(newFiles);
                            }
                          }}
                          className={`w-full bg-[#F5F0EB] text-[11px] p-3 outline-none transition-all ${attach.type === 'LINK' ? 'ring-1 ring-[#FB460D] text-[#141314]' : 'text-[#8A817C]'}`}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}
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

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#EAE4DD]">
        <div className="text-[12px] font-bold text-[#FB460D]">{errorMsg}</div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="!text-[#141314] hover:!bg-[#EAE4DD]/30" onClick={onClose}>CANCEL</Button>
          <Button onClick={handleSave} disabled={loading} className="!px-8">
            {loading ? 'STORING...' : <><Save size={16} className="mr-2" /> SAVE MODULE</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
