import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';
import { api } from '../api';

const Navbar = ({ onLogout, position = 'absolute' }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = sessionStorage.getItem('id');
        if (!userId) return;
        
        const res = await api.get('/user/userauth', {
          headers: { Authorization: token ? `${token}` : undefined },
          params: { id: userId }
        });
        setUserRole(res.data.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    fetchUserRole();
  }, []);

  const renderNavLinks = () => {
    if (userRole === 'employer') {
      return (
        <>
          <Button color="inherit" component={Link} to="/employer/home">Home</Button>
          <Button color="inherit" component={Link} to="/employer/post-jobs">Post Jobs</Button>
          <Button color="inherit" component={Link} to="/employer/candidates">Candidates</Button>
        </>
      );
    } else if (userRole === 'trainer') {
      return (
        <>
          <Button color="inherit" component={Link} to="/trainer/home">Home</Button>
          <Button color="inherit" component={Link} to="/trainer/upload-courses">Upload Courses</Button>
          <Button color="inherit" component={Link} to="/trainer/trainees">Trainees</Button>
        </>
      );
    } else {
      // Default to jobseeker links
      return (
        <>
          <Button color="inherit" component={Link} to="/home">Home</Button>
          <Button color="inherit" component={Link} to="/jobseeker">Jobs</Button>
          <Button color="inherit" component={Link} to="/trainer">Trainers</Button>
          <Button color="inherit" component={Link} to="/course">Course</Button>
          <Button color="inherit" component={Link} to="/filter">Filter</Button>
        </>
      );
    }
  };

  const getTitle = () => {
    if (userRole === 'employer') return 'Employer Dashboard';
    if (userRole === 'trainer') return 'Trainer Dashboard';
    return 'JobSkill Platform';
  };

  return (
    <AppBar position={position} sx={{ top: 0, left: 0, right: 0, background: 'transparent', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', zIndex: 2, backdropFilter: 'blur(6px)' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(80,80,80,0.5)', zIndex: 1, pointerEvents: 'none' }} />
      <Toolbar sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 0.1, fontWeight: 700, letterSpacing: 1 }}>
          {getTitle()}
        </Typography>
        <Box sx={{ display: 'flex', flexGrow: 2, justifyContent: 'center', gap: 6 }}>
          {renderNavLinks()}
          <ProfileButton sx={{ ml: 2 }} />
        </Box>
        <Button color="inherit" onClick={onLogout} sx={{ ml: 3, fontWeight: 600 }}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
