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
  const displayName = user?.username || user?.name || '';
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';

  // Get active page name
  const activePage = navItems.find(item => location.pathname.includes(item.path))?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-[#F5F0EB]">
      <PageTransition />
      
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 bg-[#141314] border-r border-[#EAE4DD] flex flex-col justify-between h-screen sticky top-0">
        <div>
          <div className="p-8 pb-12">
            <h1 className="text-[13px] tracking-[0.2em] font-bold text-[#FFFFFF] uppercase">LEARNOVA</h1>
            <p className="text-[9px] text-[#8A817C] mt-1 tracking-widest uppercase">Instructor Admin</p>
          </div>
          
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink 
                  key={item.label}
                  to={item.path}
                  className={`flex items-center space-x-3 px-8 py-4 text-[11px] tracking-widest uppercase relative interactive ${isActive ? 'text-[#FB460D]' : 'text-[#8A817C] hover:text-[#FFFFFF]'}`}
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

        <div className="p-8 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#FB460D] text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-[12px] font-semibold text-white truncate">{user?.username}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[10px] uppercase text-[#8A817C] hover:text-[#FB460D] tracking-widest font-bold interactive transition-colors"
          >
            Logout →
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-[72px] bg-[#F5F0EB]/80 backdrop-blur-md border-b border-[#EAE4DD] px-8 flex items-center justify-between sticky top-0 z-[100]">
          <div className="flex items-center">
            <h2 className="text-[18px] font-semibold text-[#141314] capitalize">{activePage}</h2>
            <span className="text-[#EAE4DD] mx-4">/</span>
            <span className="text-[12px] text-[#8A817C]">Overview</span>
          </div>
          <button className="text-[#141314] interactive hover:text-[#FB460D] transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#FB460D] rounded-full border border-[#F5F0EB]"></div>
          </button>
        </header>
        
        {/* Page Viewport */}
        <main className="flex-1 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
