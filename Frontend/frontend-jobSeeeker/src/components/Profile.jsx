// Job Seeker: Profile Component
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, MenuItem, CircularProgress, Paper } from '@mui/material';
import { api } from '../api';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const roleSpecificFields = {
  jobseeker: user => (
    <>
      <Typography sx={{ mt: 2, fontWeight: 600 }}>CV</Typography>
      {user.resumeUrl ? (
        <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">View CV</a>
      ) : (
        <Typography color="text.secondary">No CV uploaded.</Typography>
      )}
    </>
  ),
  trainer: user => (
    <TextField
      label="Expertise Area"
      value={user.expertise || ''}
      fullWidth
      margin="normal"
      InputProps={{ readOnly: true }}
    />
  ),
  employer: (user, editUser, handleInputChange) => (
    <TextField
      label="Company Name"
      name="companyName"
      value={editUser?.companyName || ''}
      onChange={handleInputChange}
      fullWidth
      margin="normal"
    />
  ),
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = sessionStorage.getItem('id');
        if (!userId) {
          console.error('User ID not found in session storage.');
          setLoading(false);
          return;
        }
        const res = await api.get('/user/userauth', {
          headers: { Authorization: token ? `${token}` : undefined },
          params: { id: userId }
        });
        setUser(res.data);
        setEditUser(res.data); // for editing
      } catch (err) {
        setUser(null);
        console.error('UserAuth error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    document.getElementById('profile-pic-input').click();
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      let url;
      if (user.role === 'jobseeker') {
        url = `/job-seekers/${user.id}/profile-picture`;
      } else {
        url = `/${user.role}s/${user.id}/profile-picture`;
      }
      const res = await api.post(url, formData, {
        headers: {
          Authorization: token ? `${token}` : undefined,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update user profile pic in UI
      setUser(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
      setEditUser(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
    } catch (err) {
      console.error('Profile picture upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      let url;
      let payload = { ...editUser };
      
      // Ensure profilePictureUrl is preserved in the payload
      if (user.profilePictureUrl) {
        payload.profilePictureUrl = user.profilePictureUrl;
      }
      
      if (editUser.role === 'jobseeker') {
        url = `/job-seekers/${editUser.id}`;
      } else if (editUser.role === 'employer') {
        url = `/employers/${editUser.id}`;
        // The employer endpoint expects 'company' field, not 'companyName'
        if (payload.companyName) {
          payload.company = payload.companyName;
          delete payload.companyName;
        }
      } else {
        url = `/${editUser.role}s/${editUser.id}`;
      }
      
      const res = await api.put(url, payload, {
        headers: { Authorization: token ? `${token}` : undefined }
      });
      
      // The backend should now return the correct EmployerDTO with 'company' field
      // We need to map it back to 'companyName' for consistency with UserDetailsDTO
      let updatedUser = { ...res.data };
      
      // For employers, ensure we have companyName for UI consistency
      if (editUser.role === 'employer' && updatedUser.company) {
        updatedUser.companyName = updatedUser.company;
      }
      
      // Preserve the resumeUrl if it exists in the current user state
      if (user.resumeUrl && !updatedUser.resumeUrl) {
        updatedUser.resumeUrl = user.resumeUrl;
      }
      
      // Always preserve the profilePictureUrl from the current user state
      if (user.profilePictureUrl) {
        updatedUser.profilePictureUrl = user.profilePictureUrl;
      }
      
      setUser(updatedUser);
      setEditUser(updatedUser);
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Helper to get correct profile picture URL
  const getProfilePicUrl = (url) => {
    if (!url) return undefined;
    // Remove any double slashes except after http(s):
    let fixedUrl = url;
    if (url.startsWith('/uploads')) fixedUrl = `http://localhost:8080${url}`;
    if (fixedUrl.match(/^https?:\/\//)) {
      // Remove accidental double slashes after host
      fixedUrl = fixedUrl.replace(/([^:]\/)\/+/, '$1/');
    }
    return fixedUrl;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
  }
  if (!user) {
    return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>Failed to load profile.</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'none', p: 0, m: 0 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, p: 4, borderRadius: 3, m: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, position: 'relative' }}>
          <input
            id="profile-pic-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicChange}
          />
          <Avatar
            src={getProfilePicUrl(user.profilePictureUrl) || undefined}
            sx={{ width: 90, height: 90, mb: 2, cursor: 'pointer', border: '2px solid #ffd700' }}
            onClick={handleAvatarClick}
          >
            {uploading && <CircularProgress size={90} sx={{ color: '#ffd700', position: 'absolute', top: 0, left: 0 }} />}
          </Avatar>
          <Button
            size="small"
            startIcon={<PhotoCamera />}
            onClick={handleAvatarClick}
            sx={{ mt: -2, mb: 1 }}
          >
            Change Photo
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.username}</Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>{user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Typography>
        </Box>
        <TextField
          label="Email"
          name="email"
          value={editUser?.email || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Name"
          name="username"
          value={editUser?.username || ''}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        {/* ...role specific fields can be made editable here if needed... */}
        {editUser?.role === 'jobseeker' && !user.resumeUrl && !editUser.resumeUrl && (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2, color: '#ffd700', borderColor: '#ffd700', fontWeight: 600 }}
          >
            Upload Resume (PDF)
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                  const token = localStorage.getItem('token');
                  const formData = new FormData();
                  formData.append('file', file);
                  // Use /job-seekers/{id}/upload-cv as per backend
                  const url = `/job-seekers/${editUser.id}/upload-cv`;
                  const res = await api.post(url, formData, {
                    headers: {
                      Authorization: token ? `${token}` : undefined,
                      'Content-Type': 'multipart/form-data',
                    },
                  });
                  setUser(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
                  setEditUser(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
                } catch (err) {
                  console.error('CV upload error:', err);
                }
              }}
            />
          </Button>
        )}
        {user.role && roleSpecificFields[user.role] && (
          user.role === 'employer' 
            ? roleSpecificFields[user.role](user, editUser, handleInputChange)
            : roleSpecificFields[user.role](user)
        )}
        <Button variant="contained" color="primary" sx={{ mt: 3, width: '100%' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;
