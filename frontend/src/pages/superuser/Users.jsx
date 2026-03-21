import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { api } from '../../api';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null, newRole: 'LEARNER' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const statsRef = useRef(null);
  const tabsRef = useRef(null);
  const tabUnderlineRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (loading) return;
    // Stats count up animation
    const statNumbers = statsRef.current?.querySelectorAll('.stat-number');
    if (statNumbers) {
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
    }

    const rows = document.querySelectorAll('.user-row');
    if (rows.length > 0) {
      gsap.fromTo(rows, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out', delay: 0.2 }
      );
    }
  }, [users, loading]);

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

  const confirmRoleChange = async () => {
    if (!roleModal.user) return;
    try {
      const data = await api.put(`/users/${roleModal.user.id}/role`, { role: roleModal.newRole });
      setUsers(users.map(u => u.id === roleModal.user.id ? { ...u, role: roleModal.newRole } : u));
      setRoleModal({ isOpen: false, user: null, newRole: 'LEARNER' });
    } catch (err) {
      alert("Failed to update role: " + err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ADMINS' && u.role !== 'ADMIN') return false;
    if (filter === 'INSTRUCTORS' && u.role !== 'INSTRUCTOR') return false;
    if (filter === 'LEARNERS' && u.role !== 'LEARNER') return false;
    
    const term = search.toLowerCase();
    const uName = (u.username || u.name || '').toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    if (search && !uName.includes(term) && !uEmail.includes(term)) return false;
    
    return true;
  });

  const totals = {
    users: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
    learners: users.filter(u => u.role === 'LEARNER').length
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

      <div ref={statsRef} className="flex border border-[#EAE4DD] bg-[#FFFFFF] mb-12 flex-wrap">
        <div className="flex-1 p-8 border-r border-[#EAE4DD]">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Total</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.users}>0</p>
        </div>
        <div className="flex-1 p-8 border-r border-[#EAE4DD]">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Admins</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.admins}>0</p>
        </div>
        <div className="flex-1 p-8 border-r border-[#EAE4DD]">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Instructors</p>
          <p className="text-4xl font-bold text-[#141314] stat-number" data-target={totals.instructors}>0</p>
        </div>
        <div className="flex-1 p-8">
          <p className="text-[10px] uppercase text-[#8A817C] tracking-widest mb-2">Learners</p>
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
        <div className="flex space-x-8 border-b border-[#EAE4DD] pb-4 overflow-x-auto">
          {['ALL', 'LEARNERS', 'INSTRUCTORS', 'ADMINS'].map(tab => (
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
        <div ref={tabUnderlineRef} className="absolute bottom-0 left-0 h-[2px] bg-[#FB460D] transition-all duration-300"></div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-6 gap-4 py-4 border-b border-[#EAE4DD] text-[10px] uppercase tracking-widest text-[#8A817C] font-bold">
          <div className="col-span-1">#</div>
          <div className="col-span-1">NAME</div>
          <div className="col-span-2">EMAIL</div>
          <div className="col-span-1">ROLE</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#8A817C] text-[12px] uppercase tracking-widest animate-pulse">Loading Users...</div>
        ) : error ? (
          <div className="py-12 text-center space-y-4">
            <div className="text-[#FB460D] text-[12px] uppercase tracking-widest font-bold text-wrap">Error: {error}</div>
            <Button onClick={fetchUsers} variant="ghost" className="text-[10px]">RETRY CONNECTION</Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-[#8A817C] text-[12px] uppercase tracking-widest">No matching users found.</div>
        ) : filteredUsers.map((u, i) => (
          <div 
            key={u.id}
            className="user-row grid grid-cols-6 gap-4 py-6 border-b border-[#EAE4DD] items-center text-[13px] interactive transition-colors"
            onMouseEnter={(e) => handleRowHover(e, true)}
            onMouseLeave={(e) => handleRowHover(e, false)}
          >
            <div className="col-span-1 text-[#8A817C]">{(i + 1).toString().padStart(2, '0')}</div>
            <div className="col-span-1 font-semibold text-[#141314] truncate pr-2">{u.username || u.name}</div>
            <div className="col-span-2 text-[#8A817C] truncate pr-2">{u.email}</div>
            <div className="col-span-1">
              <Badge variant={u.role === 'ADMIN' ? 'default' : u.role === 'INSTRUCTOR' ? 'outline' : 'muted'}>
                {u.role}
              </Badge>
            </div>
            <div className="col-span-1 text-right">
              <button 
                onClick={() => setRoleModal({ isOpen: true, user: u, newRole: u.role })}
                className="text-[10px] uppercase font-bold text-[#FB460D] tracking-widest interactive hover:text-[#141314] transition-colors"
              >
                EDIT ROLE →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={roleModal.isOpen} onClose={() => setRoleModal({ isOpen: false, user: null, newRole: 'LEARNER' })}>
        <h2 className="text-[24px] font-bold text-[#141314] uppercase mb-4 leading-tight truncate">
          CHANGE ROLE
        </h2>
        <p className="text-[12px] text-[#8A817C] mb-8">
          Select a new permission level for <span className="font-bold text-[#141314]">{roleModal.user?.username || roleModal.user?.name}</span>.
        </p>
        
        <div className="mb-8">
          <select 
            value={roleModal.newRole}
            onChange={(e) => setRoleModal({...roleModal, newRole: e.target.value})}
            className="w-full bg-[#F5F0EB] text-[#141314] border-b-2 border-[#141314] py-3 px-0 focus:outline-none focus:border-[#FB460D] transition-colors text-[14px] uppercase tracking-widest font-bold interactive cursor-pointer"
          >
            <option value="LEARNER">LEARNER</option>
            <option value="INSTRUCTOR">INSTRUCTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => setRoleModal({ isOpen: false, user: null, newRole: 'LEARNER' })} className="flex-1">
            CANCEL
          </Button>
          <Button onClick={confirmRoleChange} className="flex-1">
            CONFIRM
          </Button>
        </div>
      </Modal>
    </div>
  );
}
