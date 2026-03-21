import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart2, Settings, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Courses', path: '/admin/courses', icon: <BookOpen size={16} /> },
    { label: 'Reporting', path: '/admin/reporting', icon: <BarChart2 size={16} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={16} /> },
  ];

  // Helper to get initials
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';

  // Get active page name
  const activePage = navItems.find(item => location.pathname.includes(item.path))?.label || 'Dashboard';

  return (
    <div className="flex h-screen w-full bg-[#141314] overflow-hidden">
      <PageTransition />
      
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 bg-[#0D0B0C] border-r border-[#2E2A2B] flex flex-col justify-between">
        <div>
          <div className="p-8 pb-12">
            <h1 className="text-[13px] tracking-[0.2em] font-bold text-[#F5F0EB] uppercase">LEARNOVA</h1>
            <p className="text-[9px] text-[#6B6460] mt-1 tracking-widest uppercase">Instructor Admin</p>
          </div>
          
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink 
                  key={item.label}
                  to={item.path}
                  className={`flex items-center space-x-3 px-8 py-4 text-[11px] tracking-widest uppercase relative interactive ${isActive ? 'text-[#FB460D]' : 'text-[#6B6460] hover:text-[#F5F0EB]'}`}
                >
                  <span className="opacity-70">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FB460D]"></div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-8 border-t border-[#2E2A2B]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FB460D] text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-[12px] font-semibold text-[#F5F0EB] truncate">{user?.name}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[10px] uppercase text-[#6B6460] hover:text-[#FB460D] tracking-widest font-bold interactive transition-colors"
          >
            Logout →
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-[72px] bg-[#141314] border-b border-[#2E2A2B] px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-[18px] font-semibold text-[#F5F0EB] capitalize">{activePage}</h2>
            <span className="text-[#2E2A2B] mx-4">/</span>
            <span className="text-[12px] text-[#6B6460]">Overview</span>
          </div>
          <button className="text-[#F5F0EB] interactive hover:text-[#FB460D] transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#FB460D] rounded-full border border-[#141314]"></div>
          </button>
        </header>
        
        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto relative bg-[#141314]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
