import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

export default function SuperUserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/superuser/login');
  };

  const navItems = [
    { label: 'USERS', path: '/superuser/dashboard' },
    { label: 'LOG', path: '/superuser/log' }
  ];

  return (
    <div className="flex h-screen w-full bg-[#141314] overflow-hidden">
      <PageTransition />
      
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 bg-[#0D0B0C] border-r border-[#2E2A2B] flex flex-col justify-between">
        <div>
          <div className="p-8 pb-12">
            <h1 className="text-[13px] tracking-[0.2em] font-bold text-[#F5F0EB] uppercase">LEARNOVA</h1>
            <p className="text-[9px] text-[#6B6460] mt-1 tracking-widest uppercase">Super Admin</p>
          </div>
          
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path) || (item.path === '/superuser/dashboard' && location.pathname === '/superuser/users');
              return (
                <NavLink 
                  key={item.label}
                  to={item.path}
                  className={`flex items-center px-6 py-4 text-[12px] tracking-widest uppercase relative interactive ${isActive ? 'text-[#FB460D]' : 'text-[#6B6460] hover:text-[#F5F0EB]'}`}
                >
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FB460D]"></div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-8 border-t border-[#2E2A2B]">
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
        <main className="flex-1 overflow-y-auto relative bg-[#141314]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
