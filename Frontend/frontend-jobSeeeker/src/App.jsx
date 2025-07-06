import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import JobSeeker from './pages/JobSeeker/Jobs';
import Employer from './pages/Employer';
import Trainer from './pages/JobSeeker/Trainer';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Home from './pages/JobSeeker/Home';
import ProfilePage from './pages/ProfilePage';
import Filter from './pages/JobSeeker/Filter';
import Course from './pages/JobSeeker/Course';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
    if (token && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/home');
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
        <Route path="/trainer" element={<Trainer />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile/edit" element={<ProfilePage />} />
        <Route path="/filter" element={<Filter />} />
        <Route path="/course" element={<Course />} />
        {/* <Route path="/" element={<div>Welcome! Please select a role above.</div>} /> */}
      </Routes>
    </>
  );
}

export default App;
