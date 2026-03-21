import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { AuthProvider, useAuth } from './context/AuthContext';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import PageTransition from './components/PageTransition';

// Pages & Layouts
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SuperLogin from './pages/superuser/SuperLogin';

import SuperUserLayout from './layouts/SuperUserLayout';
import Users from './pages/superuser/Users';

import AdminLayout from './layouts/AdminLayout';
import Courses from './pages/admin/Courses';
import CourseForm from './pages/admin/CourseForm';
import QuizBuilder from './pages/admin/QuizBuilder';
import Reporting from './pages/admin/Reporting';

import LearnerLayout from './layouts/LearnerLayout';
import MyCourses from './pages/learner/MyCourses';
import CourseDetail from './pages/learner/CourseDetail';

import PlayerLayout from './layouts/PlayerLayout';
import LessonPlayer from './pages/learner/LessonPlayer';
import QuizPlayer from './pages/learner/QuizPlayer';

gsap.registerPlugin(ScrollTrigger);

import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'INSTRUCTOR') return <Navigate to="/admin/courses" replace />;
    return <Navigate to="/courses" replace />;
  }
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lenis setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <AuthProvider>
      <Cursor />
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {!loading && (
        <BrowserRouter>
          <PageTransition />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/superuser/login" element={<SuperLogin />} />
            
            {/* Admin Routes (ADMIN has all powers) */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Courses />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id/edit" element={<CourseForm />} />
              <Route path="courses/:id/quiz/:qid" element={<QuizBuilder />} />
              <Route path="users" element={<Users />} />
              <Route path="reporting" element={<Reporting />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Learner Routes */}
            <Route path="/courses" element={<ProtectedRoute allowedRoles={['LEARNER', 'ADMIN', 'INSTRUCTOR']}><LearnerLayout /></ProtectedRoute>}>
              <Route index element={<MyCourses />} />
              <Route path=":id" element={<CourseDetail />} />
            </Route>
            <Route path="/course/:id" element={<ProtectedRoute allowedRoles={['LEARNER', 'ADMIN', 'INSTRUCTOR']}><LearnerLayout /></ProtectedRoute>}>
              <Route index element={<CourseDetail />} />
            </Route>

            {/* Player Route */}
            <Route path="/courses/:id/lesson/:lid" element={<ProtectedRoute allowedRoles={['LEARNER', 'ADMIN', 'INSTRUCTOR']}><PlayerLayout /></ProtectedRoute>}>
              <Route index element={<LessonPlayer />} />
            </Route>
            <Route path="/courses/:id/quiz/:qid" element={<ProtectedRoute allowedRoles={['LEARNER', 'ADMIN', 'INSTRUCTOR']}><PlayerLayout /></ProtectedRoute>}>
              <Route index element={<QuizPlayer />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthProvider>
  );
}

export default App;
