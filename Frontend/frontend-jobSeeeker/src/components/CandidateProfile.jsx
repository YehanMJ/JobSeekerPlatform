import React from 'react';
import { Box, Typography, Avatar, Chip, Button, Paper, Divider, IconButton } from '@mui/material';
import { Close, LocationOn, Email, Work, School, Star } from '@mui/icons-material';
import "@fontsource/quicksand";

const CandidateProfile = ({ candidate, onClose }) => {
  const getProfilePicUrl = (url) => {
    if (!url) return undefined;
    let fixedUrl = url;
    if (url.startsWith('/uploads')) fixedUrl = `http://localhost:8080${url}`;
    if (fixedUrl.match(/^https?:\/\//)) {
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
    const cvUrl = getCVUrl(candidate.resumeUrl);
    if (cvUrl) {
      console.log('Opening CV URL:', cvUrl); // Debug log
      window.open(cvUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const skills = candidate.skills ? candidate.skills.split(',').map(skill => skill.trim()) : [];

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 9999,
        p: 2
      }}
      onClick={onClose}
    >
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 800, 
          maxHeight: '90vh', 
          overflow: 'auto',
          backgroundColor: '#f3f2ef'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1, p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0a66c2' }}>
              Candidate Profile
            </Typography>
            <IconButton onClick={onClose} sx={{ color: '#666' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Profile Header Section */}
        <Paper sx={{ m: 2, borderRadius: 2, overflow: 'hidden' }}>
          {/* Cover Photo Area */}
          <Box 
            sx={{ 
              height: 120, 
              background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
              position: 'relative'
            }}
          />
          
          {/* Profile Info */}
          <Box sx={{ p: 3, mt: -6, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
              <Avatar
                src={getProfilePicUrl(candidate.profilePictureUrl) || undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  border: '4px solid #fff',
                  mr: 3
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', fontFamily: 'Quicksand, sans-serif', mt: 5 }}>
                  {candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : candidate.username}
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                  Job Seeker
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#666', mb: 2 }}>
                  {candidate.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{candidate.location}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email fontSize="small" />
                    <Typography variant="body2">{candidate.email}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: '#0a66c2', 
                  '&:hover': { backgroundColor: '#004182' },
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Contact
              </Button>
              {candidate.resumeUrl && (
                <Button 
                  variant="outlined" 
                  onClick={handleCVClick}
                  sx={{ 
                    borderColor: '#0a66c2', 
                    color: '#0a66c2',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View Resume
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* About Section */}
        {candidate.about && (
          <Paper sx={{ m: 2, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000' }}>
              About
            </Typography>
            <Typography sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {candidate.about}
            </Typography>
          </Paper>
        )}

        {/* Experience Section */}
        {candidate.experience && (
          <Paper sx={{ m: 2, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Work sx={{ color: '#666' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                Experience
              </Typography>
            </Box>
            <Typography sx={{ color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {candidate.experience}
            </Typography>
          </Paper>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <Paper sx={{ m: 2, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Star sx={{ color: '#666' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                Skills
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  sx={{
                    backgroundColor: '#e7f3ff',
                    color: '#0a66c2',
                    fontWeight: 500,
                    border: '1px solid #0a66c2',
                    '&:hover': { backgroundColor: '#d4edff' }
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Profile Details */}
        <Paper sx={{ m: 2, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000' }}>
            Profile Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#666', fontWeight: 500 }}>Member since:</Typography>
              <Typography sx={{ color: '#000' }}>
                {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#666', fontWeight: 500 }}>Profile completion:</Typography>
              <Typography sx={{ color: '#0a66c2', fontWeight: 600 }}>
                {((candidate.about ? 1 : 0) + 
                  (candidate.skills ? 1 : 0) + 
                  (candidate.experience ? 1 : 0) + 
                  (candidate.resumeUrl ? 1 : 0) + 
                  (candidate.profilePictureUrl ? 1 : 0)) * 20}%
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer spacing */}
        <Box sx={{ height: 20 }} />
      </Box>
    </Box>
  );
};

export default CandidateProfile;
