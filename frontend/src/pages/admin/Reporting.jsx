import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { api } from '../../api';
import { X, SlidersHorizontal } from 'lucide-react';

export default function Reporting() {
  const statsRef = useRef(null);
  const [data, setData] = useState({ stats: { total: 0, yetToStart: 0, inProgress: 0, completed: 0 }, enrollments: [] });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [columnsPanel, setColumnsPanel] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    courseName: true,
    participantName: true,
    enrolledDate: true,
    startDate: true,
    timeSpent: true,
    completionPercentage: true,
    completedDate: true,
    status: true,
  });

  const allColumns = [
    { key: 'srNo', label: 'SR NO.' },
    { key: 'courseName', label: 'COURSE NAME' },
    { key: 'participantName', label: 'PARTICIPANT' },
    { key: 'enrolledDate', label: 'ENROLLED DATE' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'timeSpent', label: 'TIME SPENT' },
    { key: 'completionPercentage', label: 'COMPLETION %' },
    { key: 'completedDate', label: 'COMPLETED DATE' },
    { key: 'status', label: 'STATUS' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get('/reporting');
        setData(result);
      } catch (err) {
        console.error('Failed to load reporting data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || !statsRef.current) return;
    const statNumbers = statsRef.current.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          el.innerText = Math.floor(obj.val).toLocaleString();
        }
      });
    });
  }, [loading, data]);

  const filteredEnrollments = data.enrollments.filter(e => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'YET_TO_START') return e.status === 'yet_to_start';
    if (activeFilter === 'IN_PROGRESS') return e.status === 'in_progress';
    if (activeFilter === 'COMPLETED') return e.status === 'completed';
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const statusConfig = {
    yet_to_start: { label: 'YET TO START', color: 'text-[#8A817C]' },
    in_progress: { label: 'IN PROGRESS', color: 'text-[#F59E0B]' },
    completed: { label: 'COMPLETED', color: 'text-[#10B981]' },
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="relative mb-20">
        <h1 className="text-[56px] font-bold text-[#141314] tracking-[-0.03em] relative z-10 uppercase">
          REPORTING
        </h1>
        <div className="absolute -top-10 -left-6 text-[200px] font-bold text-[#EAE4DD]/30 leading-none select-none z-0">
          02
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FB460D] border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 relative z-10">
            <div 
              onClick={() => setActiveFilter('ALL')}
              className={`border bg-[#FFFFFF] p-8 border-l-[4px] border-l-[#FB460D] cursor-pointer hover:bg-[#FB460D]/5 transition-colors interactive ${activeFilter === 'ALL' ? 'ring-2 ring-[#FB460D]' : 'border-[#EAE4DD]'}`}
            >
              <p className="text-4xl font-bold text-[#141314] stat-number mb-2" data-target={data.stats.total}>0</p>
              <p className="text-[10px] uppercase text-[#8A817C] tracking-widest">TOTAL PARTICIPANTS</p>
            </div>
            
            <div 
              onClick={() => setActiveFilter('YET_TO_START')}
              className={`border bg-[#FFFFFF] p-8 border-l-[4px] border-l-[#8A817C] cursor-pointer hover:bg-[#EAE4DD]/50 transition-colors interactive ${activeFilter === 'YET_TO_START' ? 'ring-2 ring-[#8A817C]' : 'border-[#EAE4DD]'}`}
            >
              <p className="text-4xl font-bold text-[#141314] stat-number mb-2" data-target={data.stats.yetToStart}>0</p>
              <p className="text-[10px] uppercase text-[#8A817C] tracking-widest">YET TO START</p>
            </div>

            <div 
              onClick={() => setActiveFilter('IN_PROGRESS')}
              className={`border bg-[#FFFFFF] p-8 border-l-[4px] border-l-[#F59E0B] cursor-pointer hover:bg-[#F59E0B]/5 transition-colors interactive ${activeFilter === 'IN_PROGRESS' ? 'ring-2 ring-[#F59E0B]' : 'border-[#EAE4DD]'}`}
            >
              <p className="text-4xl font-bold text-[#141314] stat-number mb-2" data-target={data.stats.inProgress}>0</p>
              <p className="text-[10px] uppercase text-[#8A817C] tracking-widest">IN PROGRESS</p>
            </div>
            
            <div 
              onClick={() => setActiveFilter('COMPLETED')}
              className={`border bg-[#FFFFFF] p-8 border-l-[4px] border-l-[#10B981] cursor-pointer hover:bg-[#10B981]/5 transition-colors interactive ${activeFilter === 'COMPLETED' ? 'ring-2 ring-[#10B981]' : 'border-[#EAE4DD]'}`}
            >
              <p className="text-4xl font-bold text-[#141314] stat-number mb-2" data-target={data.stats.completed}>0</p>
              <p className="text-[10px] uppercase text-[#8A817C] tracking-widest">COMPLETED</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="relative">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[18px] font-bold text-[#141314] tracking-wide uppercase">
                {activeFilter === 'ALL' ? 'ALL PARTICIPANTS' : activeFilter.replace('_', ' ')}
                <span className="ml-3 text-[#8A817C] text-[13px] font-normal">({filteredEnrollments.length})</span>
              </h3>
              <button 
                onClick={() => setColumnsPanel(!columnsPanel)}
                className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest interactive hover:text-[#141314] transition-colors flex items-center space-x-2"
              >
                <SlidersHorizontal size={14} />
                <span>CUSTOMIZE COLUMNS</span>
              </button>
            </div>

            {/* Columns Panel */}
            {columnsPanel && (
              <div className="absolute right-0 top-12 z-50 bg-white border border-[#EAE4DD] shadow-lg p-6 w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] uppercase font-bold text-[#141314] tracking-widest">Show/Hide Columns</h4>
                  <button onClick={() => setColumnsPanel(false)} className="text-[#8A817C] hover:text-[#FB460D]">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {allColumns.map(col => (
                    <label key={col.key} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={visibleColumns[col.key]} 
                        onChange={() => toggleColumn(col.key)}
                        className="w-4 h-4 accent-[#FB460D]"
                      />
                      <span className={`text-[11px] uppercase tracking-widest font-bold ${visibleColumns[col.key] ? 'text-[#141314]' : 'text-[#8A817C]'}`}>
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div className="w-full overflow-x-auto">
              {/* Header */}
              <div className={`grid gap-4 py-4 border-b border-[#EAE4DD] text-[10px] uppercase tracking-widest text-[#8A817C] font-bold min-w-[900px]`} style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}>
                {visibleColumns.srNo && <div>#</div>}
                {visibleColumns.courseName && <div>COURSE</div>}
                {visibleColumns.participantName && <div>PARTICIPANT</div>}
                {visibleColumns.enrolledDate && <div>ENROLLED</div>}
                {visibleColumns.startDate && <div>START DATE</div>}
                {visibleColumns.timeSpent && <div>TIME SPENT</div>}
                {visibleColumns.completionPercentage && <div>COMPLETION</div>}
                {visibleColumns.completedDate && <div>COMPLETED</div>}
                {visibleColumns.status && <div>STATUS</div>}
              </div>
              
              {/* Rows */}
              {filteredEnrollments.length === 0 ? (
                <div className="py-16 text-center text-[#8A817C] text-[12px] uppercase tracking-widest">
                  No enrollment data available.
                </div>
              ) : (
                filteredEnrollments.map((row, i) => {
                  const statusInfo = statusConfig[row.status] || statusConfig.yet_to_start;
                  return (
                    <div 
                      key={row.id} 
                      className={`grid gap-4 py-5 border-b border-[#EAE4DD] items-center text-[13px] hover:bg-white/50 transition-colors min-w-[900px]`}
                      style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}
                    >
                      {visibleColumns.srNo && <div className="text-[#8A817C]">{(i + 1).toString().padStart(2, '0')}</div>}
                      {visibleColumns.courseName && <div className="font-semibold text-[#141314] truncate pr-2">{row.courseName}</div>}
                      {visibleColumns.participantName && <div className="text-[#141314]">{row.participantName}</div>}
                      {visibleColumns.enrolledDate && <div className="text-[#8A817C]">{formatDate(row.enrolledDate)}</div>}
                      {visibleColumns.startDate && <div className="text-[#8A817C]">{formatDate(row.startDate)}</div>}
                      {visibleColumns.timeSpent && <div className="text-[#8A817C] font-mono">{formatTime(row.timeSpent)}</div>}
                      {visibleColumns.completionPercentage && (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-1.5 bg-[#EAE4DD] rounded-full overflow-hidden">
                            <div className="h-full bg-[#FB460D] rounded-full transition-all" style={{ width: `${row.completionPercentage}%` }}></div>
                          </div>
                          <span className="text-[11px] font-bold text-[#141314]">{row.completionPercentage}%</span>
                        </div>
                      )}
                      {visibleColumns.completedDate && <div className="text-[#8A817C]">{formatDate(row.completedDate)}</div>}
                      {visibleColumns.status && (
                        <div>
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
