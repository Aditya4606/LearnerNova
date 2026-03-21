import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Reporting() {
  const statsRef = useRef(null);

  useEffect(() => {
    // Stats count up animation
    const statNumbers = statsRef.current.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const obj = { val: 0 };
      
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
        },
        onUpdate: () => {
          el.innerText = Math.floor(obj.val).toLocaleString();
        }
      });
    });
  }, []);

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="relative mb-20">
        <h1 className="text-[56px] font-bold text-[#F5F0EB] tracking-[-0.03em] relative z-10 uppercase">
          REPORTING
        </h1>
        <div className="absolute -top-10 -left-6 text-[200px] font-bold text-[#2E2A2B]/30 leading-none select-none z-0">
          02
        </div>
      </div>

      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 relative z-10">
        {/* Total Enrollments */}
        <div className="border border-[#2E2A2B] bg-[#1C1A1B] p-8 border-l-[4px] border-l-[#FB460D] cursor-pointer hover:bg-[#FB460D]/5 transition-colors interactive">
          <p className="text-4xl font-bold text-[#F5F0EB] stat-number mb-2" data-target="4250">0</p>
          <p className="text-[10px] uppercase text-[#6B6460] tracking-widest">TOTAL ENROLLMENTS</p>
        </div>
        
        {/* Completed */}
        <div className="border border-[#2E2A2B] bg-[#1C1A1B] p-8 border-l-[4px] border-l-[#10B981] cursor-pointer hover:bg-[#10B981]/5 transition-colors interactive">
          <p className="text-4xl font-bold text-[#F5F0EB] stat-number mb-2" data-target="1820">0</p>
          <p className="text-[10px] uppercase text-[#6B6460] tracking-widest">COMPLETED</p>
        </div>
        
        {/* In Progress */}
        <div className="border border-[#2E2A2B] bg-[#1C1A1B] p-8 border-l-[4px] border-l-[#F59E0B] cursor-pointer hover:bg-[#F59E0B]/5 transition-colors interactive">
          <p className="text-4xl font-bold text-[#F5F0EB] stat-number mb-2" data-target="2100">0</p>
          <p className="text-[10px] uppercase text-[#6B6460] tracking-widest">IN PROGRESS</p>
        </div>

        {/* Yet to start */}
        <div className="border border-[#2E2A2B] bg-[#1C1A1B] p-8 border-l-[4px] border-l-[#6B6460] cursor-pointer hover:bg-[#2E2A2B]/50 transition-colors interactive">
          <p className="text-4xl font-bold text-[#F5F0EB] stat-number mb-2" data-target="330">0</p>
          <p className="text-[10px] uppercase text-[#6B6460] tracking-widest">YET TO START</p>
        </div>
      </div>

      {/* Table Area */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-[18px] font-bold text-[#F5F0EB] tracking-wide uppercase">RECENT ACTIVITY</h3>
          <button className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest interactive hover:text-white transition-colors">
            CUSTOMIZE COLUMNS →
          </button>
        </div>
        
        <div className="w-full">
          <div className="grid grid-cols-5 gap-4 py-4 border-b border-[#2E2A2B] text-[10px] uppercase tracking-widest text-[#6B6460] font-bold">
            <div className="col-span-1">LEARNER</div>
            <div className="col-span-2">COURSE</div>
            <div className="col-span-1">STATUS</div>
            <div className="col-span-1 text-right">LAST ACTIVE</div>
          </div>
          
          {/* Mock Rows */}
          {[
            { learner: 'Jane Learner', course: 'Advanced React Patterns', status: 'COMPLETED', color: 'text-[#10B981]', date: '2 mins ago' },
            { learner: 'Alex Smith', course: 'Design Systems Architecture', status: 'IN PROGRESS', color: 'text-[#F59E0B]', date: '1 hour ago' },
            { learner: 'Maria Garcia', course: 'CSS Animations Mastery', status: 'YET TO START', color: 'text-[#6B6460]', date: '1 day ago' },
            { learner: 'David Chen', course: 'WebGL Fundamentals', status: 'IN PROGRESS', color: 'text-[#F59E0B]', date: '2 days ago' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 py-6 border-b border-[#2E2A2B] items-center text-[13px]">
              <div className="col-span-1 font-semibold text-[#F5F0EB]">{row.learner}</div>
              <div className="col-span-2 text-[#6B6460]">{row.course}</div>
              <div className="col-span-1">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${row.color}`}>{row.status}</span>
              </div>
              <div className="col-span-1 text-right text-[#6B6460]">{row.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
