import React from 'react';
import { AppBar, Toolbar, Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileButton from './ProfileButton';

const Navbar = ({ onLogout, position = 'absolute' }) => (
  <AppBar position={position} sx={{ top: 0, left: 0, right: 0, background: 'transparent', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', zIndex: 2, backdropFilter: 'blur(6px)' }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(80,80,80,0.5)', zIndex: 1, pointerEvents: 'none' }} />
    <Toolbar sx={{ position: 'relative', zIndex: 2 }}>
      <Typography variant="h6" sx={{ flexGrow: 0.1, fontWeight: 700, letterSpacing: 1 }}>
        JobSkill Platform
      </Typography>
      <Box sx={{ display: 'flex', flexGrow: 2, justifyContent: 'center', gap: 6 }}>
        <Button color="inherit" component={Link} to="/home">Home</Button>
        <Button color="inherit" component={Link} to="/jobseeker">Jobs</Button>
        <Button color="inherit" component={Link} to="/trainer">Trainers</Button>
        <Button color="inherit" component={Link} to="/filter">Filter</Button>
        <ProfileButton sx={{ ml: 2 }} />
      </Box>
      <Button color="inherit" onClick={onLogout} sx={{ ml: 3, fontWeight: 600 }}>Logout</Button>
    </Toolbar>
  </AppBar>
);

export default Navbar;
