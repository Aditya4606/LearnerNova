import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PageTransition from '../../components/PageTransition';
import { Check } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [_success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  const textContainer = useRef(null);
  const formContainer = useRef(null);
  const successContainer = useRef(null);

  useEffect(() => {
    const headings = textContainer.current.querySelectorAll('.char');
    gsap.fromTo(headings, 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
    );

    const fields = formContainer.current.children;
    gsap.fromTo(fields,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
    );
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    setSuccess(true);
    
    // Animate form out and success in
    gsap.to(formContainer.current, { opacity: 0, scale: 0.95, duration: 0.4, display: 'none' });
    gsap.fromTo(successContainer.current, 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 0.4, display: 'flex', ease: 'back.out(1.5)' }
    );

    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  const rawText = "JOIN US";
  const splitText = rawText.split('').map((char, i) => (
    <span key={i} className="char inline-block">{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <div className="flex flex-row-reverse h-screen w-full overflow-hidden bg-[#F5F0EB]">
      <PageTransition />
      
      {/* Right Half Component (Mirrored Layout) */}
      <div className="w-1/2 h-full bg-[#F5F0EB] relative p-12 flex flex-col justify-between hidden md:flex items-end text-right">
        <div className="text-[13px] uppercase tracking-[0.2em] font-bold text-[#141314]">
          LEARNOVA
        </div>
        
        <div ref={textContainer} className="flex justify-end relative">
          <div className="absolute -left-32 top-10 text-[#FB460D] text-[120px] font-bold char leading-none">+</div>
          <h1 className="text-[96px] font-[800] leading-none tracking-[-0.04em] text-[#141314] flex">
            {splitText}
          </h1>
        </div>
        
        <div className="pt-8 border-t border-[#EAE4DD] w-full max-w-md text-right flex justify-end">
          <Link to="/login" className="text-[#8A817C] hover:text-[#FB460D] transition-colors uppercase tracking-widest text-[11px] font-bold interactive">
            ← ALREADY A MEMBER? LOGIN
          </Link>
        </div>
      </div>

      {/* Left Half Form */}
      <div className="w-full md:w-1/2 h-full bg-[#FFFFFF] border-r border-[#EAE4DD] flex items-center justify-center p-8 relative">
        <form onSubmit={handleSignup} className="w-full max-w-sm space-y-6" ref={formContainer}>
          <div className="mb-10">
            <h2 className="text-[10px] uppercase text-[#FB460D] tracking-[0.2em] font-bold">
              01 — YOUR DETAILS
            </h2>
          </div>
          
          <Input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          
          <div className="pt-4">
            <Button type="submit" className="w-full">
              CREATE ACCOUNT
            </Button>
          </div>
        </form>

        <div ref={successContainer} className="hidden absolute inset-0 flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 rounded-full border-2 border-[#FB460D] flex items-center justify-center mb-6">
            <Check size={40} className="text-[#FB460D]" />
          </div>
          <h3 className="text-[24px] font-bold text-[#141314] uppercase tracking-wide">
            You're In.
          </h3>
          <p className="text-[12px] text-[#8A817C] mt-2 tracking-widest uppercase">
            Redirecting to login...
          </p>
        </div>
      </div>
    </div>
  );
}
