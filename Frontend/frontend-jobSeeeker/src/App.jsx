import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import JobSeeker from './pages/JobSeeker/Jobs';
import Employer from './pages/Employer';
import Trainer from './pages/JobSeeker/Trainer';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Home from './pages/JobSeeker/Home';
import ProfilePage from './pages/ProfilePage';
import Course from './pages/JobSeeker/Course';
import EmployerHome from './pages/Employer/Home';
import PostJobs from './pages/Employer/PostJobs';
import Candidates from './pages/Employer/Candidates';
import TrainerHome from './pages/Trainer/Home';
import UploadCourses from './pages/Trainer/UploadCourses';
import Trainees from './pages/Trainer/Trainees';
import './App.css';
import './styles/notifications.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = sessionStorage.getItem('role');
    
    if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
    if (token && (location.pathname === '/login' || location.pathname === '/register')) {
      // Redirect based on user role
      if (userRole === 'employer') {
        navigate('/employer/home');
      } else if (userRole === 'trainer') {
        navigate('/trainer/home');
      } else {
        navigate('/home');
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem('token');
    };
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return (
    <>
      {/* <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/jobseeker">Job Seeker</Link>
        <Link to="/employer">Employer</Link>
        <Link to="/trainer">Trainer</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav> */}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/jobseeker" element={<JobSeeker />} />
        <Route path="/employer" element={<Employer />} />
        <Route path="/employer/home" element={<EmployerHome />} />
        <Route path="/employer/post-jobs" element={<PostJobs />} />
        <Route path="/employer/candidates" element={<Candidates />} />
        <Route path="/trainer" element={<Trainer />} />
        <Route path="/trainer/home" element={<TrainerHome />} />
        <Route path="/trainer/upload-courses" element={<UploadCourses />} />
        <Route path="/trainer/trainees" element={<Trainees />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile/edit" element={<ProfilePage />} />
        <Route path="/course" element={<Course />} />
        {/* <Route path="/" element={<div>Welcome! Please select a role above.</div>} /> */}
      </Routes>
    </>
  );
}

export default App;
