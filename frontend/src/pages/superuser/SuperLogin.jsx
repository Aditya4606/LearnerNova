import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PageTransition from '../../components/PageTransition';

export default function SuperLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const cardRef = useRef(null);
  const flickerRef = useRef(null);

  useEffect(() => {
    // Card slide up
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 }
    );

    // Flicker effect on RESTRICTED ACCESS
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(flickerRef.current, { opacity: 0.2, duration: 0.05, delay: 2 })
      .to(flickerRef.current, { opacity: 1, duration: 0.05 })
      .to(flickerRef.current, { opacity: 0.5, duration: 0.05 })
      .to(flickerRef.current, { opacity: 1, duration: 0.05 })
      .to(flickerRef.current, { opacity: 0.8, duration: 0.5 })
      .to(flickerRef.current, { opacity: 1, duration: 2 });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      const u = login(email, password);
      if (u.role === 'superuser') {
        navigate('/superuser/dashboard');
      } else {
        setError('Unauthorized access level.');
      }
    } catch {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0B0C] flex flex-col items-center pt-32 px-4 relative">
      <PageTransition />
      
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-[#1C1A1B] border border-[#FB460D]/20 p-16 shadow-2xl relative"
      >
        <div className="flex flex-col items-center mb-12 text-center">
          <div 
            ref={flickerRef} 
            className="text-[#FB460D] font-mono text-[10px] uppercase tracking-widest mb-6"
          >
            [RESTRICTED ACCESS]
          </div>
          <h1 className="text-[18px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB]">
            LEARNOVA
          </h1>
          <div className="w-12 h-[1px] bg-[#2E2A2B] my-4"></div>
          <h2 className="text-[11px] tracking-widest uppercase text-[#6B6460]">
            Super Admin
          </h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            type="email" 
            placeholder="System Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Access Key" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-[10px] text-[#FB460D] uppercase tracking-widest mt-2">{error}</p>}
          
          <div className="pt-6">
            <Button type="submit" className="w-full !px-4 hover:shadow-[0_0_15px_rgba(251,70,13,0.3)] transition-shadow">
              AUTHENTICATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
