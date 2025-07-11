// Job Seeker: Profile Component
import React, { use, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, MenuItem, CircularProgress, Paper, IconButton } from '@mui/material';
import { api } from '../api';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LoadingScreen from './LoadingScreen';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // Track which card is being edited

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

  const handleCompanyLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || user.role !== 'employer') return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const url = `/employers/${user.id}/company-logo`;
      const res = await api.post(url, formData, {
        headers: {
          Authorization: token ? `${token}` : undefined,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update company logo in UI
      setUser(prev => ({ ...prev, companyLogoUrl: res.data.companyLogoUrl }));
      setEditUser(prev => ({ ...prev, companyLogoUrl: res.data.companyLogoUrl }));
    } catch (err) {
      console.error('Company logo upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditCard = (cardName) => {
    setEditingCard(cardName);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditUser({ ...user }); // Reset to original values
  };

  const handleSaveCard = async (cardName) => {
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
      } else if (editUser.role === 'trainer') {
        url = `/trainers/${editUser.id}`;
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
      setEditingCard(null);
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

  // Helper to get correct CV URL
  const getCVUrl = (url) => {
    if (!url) return undefined;
    let fixedUrl = url;
    if (url.startsWith('/uploads')) {
      fixedUrl = `http://localhost:8080${url}`;
    } else if (url.startsWith('C:') || url.startsWith('/C:')) {
      // Handle Windows absolute paths - convert to relative path
      const pathParts = url.split('/');
      const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
      if (uploadsIndex !== -1) {
        const relativePath = '/' + pathParts.slice(uploadsIndex).join('/');
        fixedUrl = `http://localhost:8080${relativePath}`;
      }
    }
    if (fixedUrl.match(/^https?:\/\//)) {
      // Remove accidental double slashes after host
      fixedUrl = fixedUrl.replace(/([^:]\/)\/+/, '$1/');
    }
    return fixedUrl;
  };

  // Helper to handle CV link click
  const handleCVClick = (e) => {
    e.preventDefault();
    const cvUrl = getCVUrl(user.resumeUrl);
    if (cvUrl) {
      window.open(cvUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }
  if (!user) {
    return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>Failed to load profile.</Typography>;
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', background: '#f8f9fa', p: 0, m: 0 }}>
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', pt: 4, px: { xs: 2, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1, mt: 6 }}>
            Personal Info
          </Typography>
          <Typography sx={{ color: '#7f8c8d', fontSize: '1rem' }}>
            Update your profile, contact details, and preferences to personalize your experience.
          </Typography>
        </Box>

        {/* Profile Picture Card */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <input
                id="profile-pic-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
              <Avatar
                src={getProfilePicUrl(user.profilePictureUrl) || undefined}
                sx={{ width: 80, height: 80, cursor: 'pointer' }}
                onClick={handleAvatarClick}
              >
                {uploading && <CircularProgress size={80} sx={{ position: 'absolute', top: 0, left: 0 }} />}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                  Profile picture
                </Typography>
                <Typography sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                  PNG, JPEG under 15MB
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={handleAvatarClick}
              sx={{ 
                bgcolor: '#2c3e50', 
                color: 'white',
                '&:hover': { bgcolor: '#34495e' },
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Upload
            </Button>
          </Box>
        </Paper>

        {/* Basic Information Card */}
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Basic Information
            </Typography>
            <Box>
              {editingCard === 'basic' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={() => handleSaveCard('basic')}
                    disabled={saving}
                    sx={{ color: '#27ae60' }}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton 
                    onClick={handleCancelEdit}
                    sx={{ color: '#e74c3c' }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton 
                  onClick={() => handleEditCard('basic')}
                  sx={{ color: '#7f8c8d' }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                First name
              </Typography>
              {editingCard === 'basic' ? (
                <TextField
                  name="firstName"
                  value={editUser?.firstName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  {user?.firstName || 'Not provided'}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                Last name
              </Typography>
              {editingCard === 'basic' ? (
                <TextField
                  name="lastName"
                  value={editUser?.lastName || ''}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  {user?.lastName || 'Not provided'}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
              Username
            </Typography>
            {editingCard === 'basic' ? (
              <TextField
                name="username"
                value={editUser?.username || ''}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa'
                  }
                }}
              />
            ) : (
              <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                {user?.username || 'Not provided'}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
              Email
            </Typography>
            {editingCard === 'basic' ? (
              <TextField
                name="email"
                value={editUser?.email || ''}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa'
                  }
                }}
              />
            ) : (
              <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                {user?.email || 'Not provided'}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Job Seeker Specific Cards */}
        {user.role === 'jobseeker' && (
          <>
            {/* About Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  About
                </Typography>
                <Box>
                  {editingCard === 'about' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleSaveCard('about')}
                        disabled={saving}
                        sx={{ color: '#27ae60' }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit}
                        sx={{ color: '#e74c3c' }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton 
                      onClick={() => handleEditCard('about')}
                      sx={{ color: '#7f8c8d' }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {editingCard === 'about' ? (
                <TextField
                  name="about"
                  value={editUser?.about || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Tell us about yourself, your career goals, and what you're looking for..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, minHeight: 100, whiteSpace: 'pre-line' }}>
                  {user?.about || 'Tell us about yourself, your career goals, and what you\'re looking for...'}
                </Typography>
              )}
            </Paper>

            {/* Skills Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Skills
                </Typography>
                <Box>
                  {editingCard === 'skills' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleSaveCard('skills')}
                        disabled={saving}
                        sx={{ color: '#27ae60' }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit}
                        sx={{ color: '#e74c3c' }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton 
                      onClick={() => handleEditCard('skills')}
                      sx={{ color: '#7f8c8d' }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {editingCard === 'skills' ? (
                <TextField
                  name="skills"
                  value={editUser?.skills || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="List your key skills (e.g., JavaScript, React, Node.js, Project Management...)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, minHeight: 80, whiteSpace: 'pre-line' }}>
                  {user?.skills || 'List your key skills (e.g., JavaScript, React, Node.js, Project Management...)'}
                </Typography>
              )}
            </Paper>

            {/* Experience Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Experience
                </Typography>
                <Box>
                  {editingCard === 'experience' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleSaveCard('experience')}
                        disabled={saving}
                        sx={{ color: '#27ae60' }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit}
                        sx={{ color: '#e74c3c' }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton 
                      onClick={() => handleEditCard('experience')}
                      sx={{ color: '#7f8c8d' }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {editingCard === 'experience' ? (
                <TextField
                  name="experience"
                  value={editUser?.experience || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={5}
                  variant="outlined"
                  placeholder="Describe your work experience, projects, and achievements..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, minHeight: 120, whiteSpace: 'pre-line' }}>
                  {user?.experience || 'Describe your work experience, projects, and achievements...'}
                </Typography>
              )}
            </Paper>

            {/* CV/Resume Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  CV/Resume
                </Typography>
              </Box>

              {user.resumeUrl ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography sx={{ color: '#27ae60', fontWeight: 500 }}>
                    ✓ CV uploaded
                  </Typography>
                  <Button
                    onClick={handleCVClick}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#2c3e50',
                      color: '#2c3e50',
                      '&:hover': { borderColor: '#34495e', backgroundColor: '#f8f9fa' }
                    }}
                  >
                    View CV
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#e74c3c',
                      color: '#e74c3c',
                      '&:hover': { borderColor: '#c0392b', backgroundColor: '#fdf2f2' }
                    }}
                  >
                    Replace CV
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
                </Box>
              ) : (
                <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography sx={{ color: '#7f8c8d', mb: 2 }}>
                    No CV uploaded. Upload your resume to improve your visibility to employers.
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: '#2c3e50',
                      color: '#2c3e50',
                      '&:hover': { borderColor: '#34495e', backgroundColor: '#f8f9fa' }
                    }}
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
                </Box>
              )}
            </Paper>
          </>
        )}

        {/* Employer Specific Card */}
        {user.role === 'employer' && (
          <>
            {/* Company Logo Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    id="company-logo-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCompanyLogoChange}
                  />
                  <Avatar
                    src={getProfilePicUrl(user.companyLogoUrl) || undefined}
                    sx={{ width: 80, height: 80, cursor: 'pointer' }}
                    onClick={() => document.getElementById('company-logo-input').click()}
                  >
                    {uploading && <CircularProgress size={80} sx={{ position: 'absolute', top: 0, left: 0 }} />}
                    {!user.companyLogoUrl && <Typography sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
                      {(user.companyName || 'C').charAt(0).toUpperCase()}
                    </Typography>}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                      Company logo
                    </Typography>
                    <Typography sx={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                      PNG, JPEG under 15MB
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={() => document.getElementById('company-logo-input').click()}
                  sx={{ 
                    bgcolor: '#2c3e50', 
                    color: 'white',
                    '&:hover': { bgcolor: '#34495e' },
                    textTransform: 'none',
                    borderRadius: 2
                  }}
                >
                  Upload
                </Button>
              </Box>
            </Paper>

            {/* Company Information Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Company Information
                </Typography>
                <Box>
                  {editingCard === 'company' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleSaveCard('company')}
                        disabled={saving}
                        sx={{ color: '#27ae60' }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit}
                        sx={{ color: '#e74c3c' }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton 
                      onClick={() => handleEditCard('company')}
                      sx={{ color: '#7f8c8d' }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  Company Name
                </Typography>
                {editingCard === 'company' ? (
                  <TextField
                    name="companyName"
                    value={editUser?.companyName || ''}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    {user?.companyName || 'Company name not provided'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  Location
                </Typography>
                {editingCard === 'company' ? (
                  <TextField
                    name="location"
                    value={editUser?.location || ''}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="City, Country"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    {user?.location || 'Location not provided'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  Company Overview
                </Typography>
                {editingCard === 'company' ? (
                  <TextField
                    name="overview"
                    value={editUser?.overview || ''}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Describe your company, mission, and what makes it special..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, minHeight: 100, whiteSpace: 'pre-line' }}>
                    {user?.overview || 'Describe your company, mission, and what makes it special...'}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Industry
                  </Typography>
                  {editingCard === 'company' ? (
                    <TextField
                      name="industry"
                      value={editUser?.industry || ''}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Technology, Healthcare, Finance"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      {user?.industry || 'Industry not provided'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Company Size
                  </Typography>
                  {editingCard === 'company' ? (
                    <TextField
                      name="companySize"
                      value={editUser?.companySize || ''}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      {user?.companySize || 'Company size not provided'}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  Website
                </Typography>
                {editingCard === 'company' ? (
                  <TextField
                    name="website"
                    value={editUser?.website || ''}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    placeholder="https://www.company.com"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    {user?.website ? (
                      <Box component="a" href={user.website} target="_blank" rel="noopener noreferrer" sx={{ color: '#2c3e50', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {user.website}
                      </Box>
                    ) : (
                      'Website not provided'
                    )}
                  </Typography>
                )}
              </Box>
            </Paper>
          </>
        )}

        {/* Trainer Specific Card */}
        {user.role === 'trainer' && (
          <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #e9ecef', position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                Trainer Information
              </Typography>
              {editingCard !== 'trainer' && (
                <IconButton onClick={() => handleEditCard('trainer')} sx={{ color: '#007bff' }}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            {editingCard === 'trainer' ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Expertise Area"
                    name="expertise"
                    value={editUser?.expertise || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={editUser?.bio || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Tell us about yourself, your teaching philosophy, and background..."
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Experience"
                    name="experience"
                    value={editUser?.experience || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Describe your teaching and professional experience..."
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Certifications"
                    name="certifications"
                    value={editUser?.certifications || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="List your relevant certifications, degrees, and qualifications..."
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Achievements"
                    name="achievements"
                    value={editUser?.achievements || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Share your notable achievements, awards, and recognitions..."
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancelEdit} variant="outlined" color="secondary">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveCard('trainer')} 
                    variant="contained" 
                    color="primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Expertise Area
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    {user?.expertise || 'Expertise area not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Bio
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
                    {user?.bio || 'Bio not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Experience
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
                    {user?.experience || 'Experience not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Certifications
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
                    {user?.certifications || 'Certifications not provided'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    Achievements
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '1rem', p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
                    {user?.achievements || 'Achievements not provided'}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
