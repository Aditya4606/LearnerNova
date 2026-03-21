import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Toggle from '../../components/Toggle';
import Modal from '../../components/Modal';

export default function QuizBuilder() {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [rewardsModal, setRewardsModal] = useState(false);

  // Mock quiz state
  const questions = [1, 2, 3, 4];
  const options = ['First Option', 'Second Option', 'Third Option', 'Fourth Option'];

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-[#141314]">
      {/* Sidebar Panel */}
      <div className="w-[280px] flex-shrink-0 bg-[#0D0B0C] border-r border-[#2E2A2B] flex flex-col justify-between py-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-[#6B6460] hover:text-[#FB460D] interactive flex items-center space-x-2 px-8 mb-8">
            <ArrowLeft size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">BACK TO COURSE</span>
          </button>
          
          <div className="px-8 mb-4">
            <h3 className="text-[12px] text-[#F5F0EB] uppercase tracking-widest font-bold">QUESTIONS</h3>
          </div>
          
          <div className="flex flex-col">
            {questions.map(q => (
              <button 
                key={q}
                onClick={() => setActiveQuestion(q)}
                className={`py-4 px-8 text-left text-[11px] tracking-widest font-bold uppercase transition-colors relative border-l-4 ${activeQuestion === q ? 'border-[#FB460D] bg-[#1C1A1B] text-[#FB460D]' : 'border-transparent text-[#6B6460] hover:bg-[#1C1A1B] hover:text-[#F5F0EB]'}`}
              >
                QUESTION {q.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          
          <div className="px-8 mt-6">
            <button className="text-[10px] text-[#FB460D] uppercase font-bold tracking-widest interactive hover:text-[#F5F0EB]">
              + ADD QUESTION
            </button>
          </div>
        </div>

        <div className="px-8 pt-8 border-t border-[#2E2A2B]">
          <Button variant="ghost" className="w-full !px-0" onClick={() => setRewardsModal(true)}>
            REWARDS CONFIG
          </Button>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col overflow-y-auto p-12">
        <div className="max-w-3xl w-full">
          <div className="mb-12">
            <textarea 
              className="w-full bg-transparent border-0 border-b border-[#2E2A2B] text-[#F5F0EB] text-[24px] font-bold py-4 outline-none resize-none focus:border-[#FB460D] transition-colors h-32"
              placeholder="Type your question here..."
              defaultValue="What is the primary methodology to follow when building extensible React components?"
            />
          </div>

          <div className="space-y-4 mb-8">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center group bg-[#1C1A1B] border border-[#2E2A2B] ">
                <div className="w-16 h-[72px] flex items-center justify-center border-r border-[#2E2A2B]">
                  <div className={`w-5 h-5 rounded-full border-2 interactive cursor-pointer flex items-center justify-center ${i === 0 ? 'border-[#FB460D]' : 'border-[#6B6460]'}`}>
                    {i === 0 && <div className="w-2.5 h-2.5 bg-[#FB460D] rounded-full"></div>}
                  </div>
                </div>
                <input 
                  type="text" 
                  className="flex-1 bg-transparent border-none text-[#F5F0EB] px-6 outline-none"
                  defaultValue={opt}
                />
                <button className="w-16 h-[72px] flex items-center justify-center text-[#2E2A2B] hover:text-[#D63031] transition-colors border-l border-[#2E2A2B] interactive">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button className="text-[11px] text-[#FB460D] uppercase font-bold tracking-widest interactive hover:text-[#F5F0EB]">
            + ADD OPTION
          </button>
        </div>
      </div>

      <RewardsModal isOpen={rewardsModal} onClose={() => setRewardsModal(false)} />
    </div>
  );
}

function RewardsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-[28px] font-bold text-[#F5F0EB] uppercase mb-8 leading-tight">
        POINT REWARDS
      </h2>
      <div className="space-y-4 mb-10">
        {[
          { label: '1ST ATTEMPT', pts: '10' },
          { label: '2ND ATTEMPT', pts: '7' },
          { label: '3RD ATTEMPT', pts: '4' },
          { label: '4TH+ ATTEMPT', pts: '2' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between border-b border-[#2E2A2B] py-4">
            <span className="text-[11px] font-bold text-[#6B6460] tracking-widest uppercase">{row.label}</span>
            <div className="w-24">
              <input 
                type="number" 
                defaultValue={row.pts} 
                className="w-full bg-transparent border-0 text-right text-[#F5F0EB] text-xl font-bold outline-none font-mono"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose}>SAVE CONFIG</Button>
      </div>
    </Modal>
  );
}
