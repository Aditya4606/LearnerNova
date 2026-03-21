import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PageTransition from '../../components/PageTransition';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || null;
  
  const textContainer = useRef(null);
  const formContainer = useRef(null);

  useEffect(() => {
    // Left side text reveal
    const headings = textContainer.current.querySelectorAll('.char');
    gsap.fromTo(headings, 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
    );

    // Form slide in
    const fields = formContainer.current.children;
    gsap.fromTo(fields,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'INSTRUCTOR') navigate('/admin/courses');
      else navigate('/courses');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    }
  };

  // Splitting text for GSAP
  const rawText = "SIGN IN";
  const splitText = rawText.split('').map((char, i) => (
    <span key={i} className="char inline-block">{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F0EB]">
      <PageTransition />
      
      {/* Left Half Component */}
      <div className="w-1/2 h-full bg-[#F5F0EB] relative p-12 flex flex-col justify-between hidden md:flex">
        <div className="text-[13px] uppercase tracking-[0.2em] font-bold text-[#141314]">
          LEARNOVA
        </div>
        
        <div ref={textContainer}>
          <h1 className="text-[96px] font-[800] leading-none tracking-[-0.04em] text-[#141314] flex">
            {splitText}
            <span className="text-[#FB460D] ml-4 char inline-block">/</span>
          </h1>
        </div>
        
        <div className="pt-8 border-t border-[#EAE4DD] w-full max-w-md">
          <Link to="/signup" className="text-[#8A817C] hover:text-[#FB460D] transition-colors uppercase tracking-widest text-[11px] font-bold interactive">
            New here? Create an account →
          </Link>
        </div>
      </div>

      {/* Right Half Form */}
      <div className="w-full md:w-1/2 h-full bg-[#FFFFFF] flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6" ref={formContainer}>
          <div className="mb-10">
            <h2 className="text-[10px] uppercase text-[#FB460D] tracking-[0.2em] font-bold">
              01 — CREDENTIALS
            </h2>
          </div>
          
          <Input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-[12px] text-[#FB460D]">{error}</p>}
          
          <div className="pt-4">
            <Button type="submit" className="w-full">
              ENTER PLATFORM
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <a href="#" className="text-[12px] text-[#8A817C] hover:text-[#141314] transition-colors interactive">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
