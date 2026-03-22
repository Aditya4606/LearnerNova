import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PageTransition from '../../components/PageTransition';
import { X, Mail, KeyRound, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api';

const validatePassword = (pwd) => {
  if (pwd.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character.';
  return null;
};

// ─── Forgot Password Modal ──────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=email 2=otp 3=newpass 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const cardRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const animateStep = (cb) => {
    gsap.to(cardRef.current, { x: -30, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
      cb();
      gsap.fromTo(cardRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }});
  };

  // OTP input handling
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      animateStep(() => setStep(2));
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email });
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const otpStr = otp.join('');
    if (otpStr.length < 6) return setError('Please enter all 6 digits');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpStr });
      animateStep(() => setStep(3));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    const otpStr = otp.join('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otpStr, newPassword });
      animateStep(() => setStep(4));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = { 1: <Mail size={28} />, 2: <KeyRound size={28} />, 3: <Lock size={28} />, 4: <CheckCircle2 size={28} /> };
  const stepLabels = { 1: 'ENTER EMAIL', 2: 'VERIFY OTP', 3: 'NEW PASSWORD', 4: 'SUCCESS' };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div ref={cardRef} className="bg-white border border-[#EAE4DD] shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#EAE4DD]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#FB460D]/10 border border-[#FB460D]/30 flex items-center justify-center text-[#FB460D]">
              {stepIcons[step]}
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#FB460D] uppercase">Step {step < 4 ? step : '3'} of 3</p>
              <p className="text-[13px] font-black tracking-tight text-[#141314]">{stepLabels[step]}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8A817C] hover:text-[#141314] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex h-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 transition-all duration-500 ${step > s || (step === s) ? 'bg-[#FB460D]' : 'bg-[#EAE4DD]'}`} />
          ))}
        </div>

        <div className="px-8 py-8">
          {/* STEP 1 — Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <p className="text-[13px] text-[#8A817C] leading-relaxed">Enter your registered email and we'll send you a 6-digit OTP.</p>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
              {error && <p className="text-[12px] text-[#FB460D]">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'SENDING...' : 'SEND OTP →'}
              </Button>
            </form>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-[13px] text-[#8A817C]">OTP sent to <span className="text-[#141314] font-bold">{email}</span>. Expires in 10 minutes.</p>
              <div className="flex space-x-2 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    className="w-11 h-14 text-center text-[22px] font-black text-[#141314] border-2 border-[#EAE4DD] focus:border-[#FB460D] focus:outline-none bg-[#FAFAFA] transition-colors"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              {error && <p className="text-[12px] text-[#FB460D] text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'VERIFYING...' : 'VERIFY OTP →'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#8A817C] hover:text-[#FB460D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 — New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-[13px] text-[#8A817C]">Create a strong new password. Min 8 chars, uppercase, lowercase, number, special char.</p>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A817C]" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {error && <p className="text-[12px] text-[#FB460D]">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'RESETTING...' : 'RESET PASSWORD →'}
              </Button>
            </form>
          )}

          {/* STEP 4 — Done */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 mx-auto bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-[18px] font-black text-[#141314] mb-2">Password Reset!</h3>
                <p className="text-[13px] text-[#8A817C]">Your password has been updated. You can now log in with your new password.</p>
              </div>
              <Button onClick={onClose} className="w-full">BACK TO LOGIN</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || null;
  
  const textContainer = useRef(null);
  const formContainer = useRef(null);

  useEffect(() => {
    const headings = textContainer.current.querySelectorAll('.char');
    gsap.fromTo(headings, 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
    );
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
      setError('Invalid email or password');
    }
  };

  const rawText = "SIGN IN";
  const splitText = rawText.split('').map((char, i) => (
    <span key={i} className="char inline-block">{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F0EB]">
      <PageTransition />
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      
      {/* Left Half */}
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
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-[12px] text-[#8A817C] hover:text-[#FB460D] transition-colors interactive"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
