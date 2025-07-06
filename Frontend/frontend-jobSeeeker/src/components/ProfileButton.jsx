import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { api } from '../api';

const ProfileButton = ({ sx = {} }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="contained"
      sx={{ ml: 2, background: '#ffd700', color: '#1e3c72', fontWeight: 600, ...sx }}
      onClick={async (e) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem('token');
          const userId = sessionStorage.getItem('id');
          if (!userId) {
            console.error('User ID not found in session storage.');
            return;
          }
          const res = await api.get('/user/userauth', {
            headers: { Authorization: token ? `${token}` : undefined },
            params: { id: userId }
          });
          console.log('UserAuth response:', res.data);
          navigate('/profile/edit');
        } catch (err) {
          console.error('UserAuth error:', err);
        }
      }}
    >
      Profile
    </Button>
  );
};

export default ProfileButton;
