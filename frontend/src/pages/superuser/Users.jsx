import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MOCK_USERS } from '../../mockData';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

export default function Users() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [promoteModal, setPromoteModal] = useState({ isOpen: false, user: null });
  
  const statsRef = useRef(null);
  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);

  useEffect(() => {
    // Stats count up animation
    const statNumbers = statsRef.current.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          el.innerText = Math.floor(obj.val);
        }
      });
    });

    const rows = document.querySelectorAll('.user-row');
    gsap.fromTo(rows, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out', delay: 0.2 }
    );
  }, [users]);

  const handleTabClick = (tab, e) => {
    setFilter(tab);
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
    if (el && filter === 'ALL' && tabUnderlineRef.current?.style.width === '') {
      const rect = el.getBoundingClientRect();
      const parentRect = tabsRef.current.getBoundingClientRect();
      gsap.set(tabUnderlineRef.current, {
        x: rect.left - parentRect.left,
        width: rect.width
      });
    }
  };

  const handleRowHover = (e, isHovering) => {
    const row = e.currentTarget;
    if (isHovering) {
      gsap.to(row, { backgroundColor: '#FFFFFF', x: 4, duration: 0.2 });
    } else {
      gsap.to(row, { backgroundColor: 'transparent', x: 0, duration: 0.2 });
    }
  };

  const confirmPromotion = () => {
    setUsers(users.map(u => u.id === promoteModal.user.id ? { ...u, role: 'admin' } : u));
    setPromoteModal({ isOpen: false, user: null });
  };

  const demoteUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: 'learner' } : u));
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ADMINS' && u.role !== 'admin') return false;
    if (filter === 'LEARNERS' && u.role !== 'learner') return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return u.role !== 'superuser'; // hide superuser from list usually
  });

  const totals = {
    users: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    learners: users.filter(u => u.role === 'learner').length
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <div className="relative mb-16">
        <h1 className="text-[56px] font-bold text-[#141314] tracking-[-0.03em] relative z-10 uppercase">
          USER CONTROL
        </h1>
        <div className="absolute -top-10 -left-6 text-[200px] font-bold text-[#EAE4DD]/30 leading-none select-none z-0">
          01
        </div>
      </div>

      <div ref={statsRef} className="flex border border-[#EAE4DD] bg-[#FFFFFF] mb-12">
        <div className="flex-1 p-8 border-r border-[#EAE4DD]">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Total Users</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.users}>0</p>
        </div>
        <div className="flex-1 p-8 border-r border-[#EAE4DD]">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Total Admins</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.admins}>0</p>
        </div>
        <div className="flex-1 p-8">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Total Learners</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.learners}>0</p>
        </div>
      </div>

      <div className="mb-8">
        <Input 
          placeholder="SEARCH USERS..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="relative mb-6" ref={tabsRef}>
        <div className="flex space-x-8 border-b border-[#EAE4DD] pb-4">
          {['ALL', 'LEARNERS', 'ADMINS'].map(tab => (
            <button 
              key={tab}
              ref={tab === 'ALL' ? initTabRef : null}
              onClick={(e) => handleTabClick(tab, e)}
              className={`text-[11px] uppercase tracking-widest font-bold interactive ${filter === tab ? 'text-[#141314]' : 'text-[#8A817C]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D]"></div>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 py-4 border-b border-[#EAE4DD] text-[10px] uppercase tracking-widest text-[#8A817C] font-bold">
          <div className="col-span-1">#</div>
          <div className="col-span-1">NAME</div>
          <div className="col-span-2">EMAIL</div>
          <div className="col-span-1">ROLE</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        {/* Table Rows */}
        {filteredUsers.map((u, i) => (
          <div 
            key={u.id}
            className="user-row grid grid-cols-6 gap-4 py-6 border-b border-[#EAE4DD] items-center text-[13px] interactive transition-colors"
            onMouseEnter={(e) => handleRowHover(e, true)}
            onMouseLeave={(e) => handleRowHover(e, false)}
          >
            <div className="col-span-1 text-[#8A817C]">{(i + 1).toString().padStart(2, '0')}</div>
            <div className="col-span-1 font-semibold text-[#141314]">{u.name}</div>
            <div className="col-span-2 text-[#8A817C]">{u.email}</div>
            <div className="col-span-1">
              {u.role === 'admin' ? (
                <Badge variant="default">Admin</Badge>
              ) : (
                <Badge variant="muted">Learner</Badge>
              )}
            </div>
            <div className="col-span-1 text-right">
              {u.role === 'learner' ? (
                <button 
                  onClick={() => setPromoteModal({ isOpen: true, user: u })}
                  className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest interactive hover:text-white transition-colors"
                >
                  PROMOTE →
                </button>
              ) : (
                <button 
                  onClick={() => demoteUser(u.id)}
                  className="text-[10px] uppercase font-bold text-[#D63031] tracking-widest interactive hover:text-white transition-colors"
                >
                  DEMOTE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={promoteModal.isOpen} onClose={() => setPromoteModal({ isOpen: false, user: null })}>
        <h2 className="text-[28px] font-bold text-[#141314] uppercase mb-8 leading-tight">
          PROMOTE {promoteModal.user?.name} TO ADMIN?
        </h2>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => setPromoteModal({ isOpen: false, user: null })} className="flex-1">
            CANCEL
          </Button>
          <Button onClick={confirmPromotion} className="flex-1">
            CONFIRM
          </Button>
        </div>
      </Modal>
    </div>
  );
}
