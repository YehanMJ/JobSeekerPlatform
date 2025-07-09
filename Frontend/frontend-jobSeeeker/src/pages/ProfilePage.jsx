import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg,rgb(0,0,0) 0%,rgb(0,0,0) 100%)' }}>
      <Navbar onLogout={handleLogout} />
      <Profile />
    </Box>
  );
};

export default ProfilePage;
