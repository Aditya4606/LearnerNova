import React, { useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import Button from '../components/Button';

export default function LearnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    // Hide navbar on scroll down, show on scroll up
    const showAnim = gsap.from(navRef.current, { 
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: 'power2.out'
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1) { // scrolling down
          showAnim.reverse();
        } else { // scrolling up
          showAnim.play();
        }
      }
    });
    
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LR';

  return (
    <div className="min-h-screen bg-[#141314] w-full flex flex-col relative">
      <PageTransition />
      
      {/* Sticky Navbar */}
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 right-0 h-[72px] bg-[#141314]/80 backdrop-blur-md border-b border-[#2E2A2B] z-[4000] px-8 flex items-center justify-between"
      >
        <div className="w-[200px]">
          <NavLink to="/courses" className="text-[13px] tracking-[0.2em] font-bold text-[#F5F0EB] uppercase interactive">
            LEARNOVA
          </NavLink>
        </div>
        
        <div className="flex-1 flex justify-center">
          <NavLink 
            to="/courses" 
            className={({isActive}) => `text-[11px] uppercase tracking-widest font-semibold interactive transition-colors ${isActive ? 'text-[#FB460D]' : 'text-[#6B6460] hover:text-[#F5F0EB]'}`}
          >
            COURSES
          </NavLink>
        </div>
        
        <div className="w-[200px] flex justify-end items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-[12px] font-semibold text-[#F5F0EB] hidden sm:block">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-[#FB460D] text-white flex items-center justify-center text-[10px] font-bold">
                  {initials}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] uppercase text-[#6B6460] hover:text-[#FB460D] tracking-widest font-bold interactive transition-colors"
                title="Logout"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} variant="ghost" className="!px-4 !py-2 !text-[10px]">Login</Button>
              <Button onClick={() => navigate('/signup')} className="!px-4 !py-2 !text-[10px]">Sign Up</Button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
    </div>
  );
}
