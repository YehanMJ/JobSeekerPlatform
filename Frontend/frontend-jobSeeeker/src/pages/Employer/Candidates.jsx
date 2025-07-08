import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Box, Button, Typography, Card, CardContent, Avatar, Chip, Fade, Tabs, Tab } from '@mui/material';
import '../../App.css';
import "@fontsource/quicksand";
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import CandidateProfile from '../../components/CandidateProfile';

const Candidates = () => {
  const navigate = useNavigate();
  const [allCandidates, setAllCandidates] = useState([]);
  const [appliedCandidates, setAppliedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIn, setCardIn] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const employerId = sessionStorage.getItem('id');
        
        // Fetch all users
        const usersRes = await api.get('/user/all', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        const jobSeekers = usersRes.data.filter(u => u.role === 'jobseeker');
        setAllCandidates(jobSeekers);
        
        // Fetch employer's jobs
        const jobsRes = await api.get('/jobs', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        const employerJobs = jobsRes.data.filter(job => job.employerId === parseInt(employerId));
        setJobs(employerJobs);
        
        // Fetch applications
        const applicationsRes = await api.get('/applications', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        const allApplications = applicationsRes.data;
        setApplications(allApplications);
        
        // Filter applications for employer's jobs
        const employerJobIds = employerJobs.map(job => job.id);
        const employerApplications = allApplications.filter(app => 
          employerJobIds.includes(app.jobId)
        );
        
        // Get unique candidate IDs who applied
        const appliedCandidateIds = [...new Set(employerApplications.map(app => app.jobSeekerId))];
        
        // Get candidate details for those who applied
        const appliedCandidatesList = jobSeekers.filter(candidate => 
          appliedCandidateIds.includes(candidate.id)
        );
        setAppliedCandidates(appliedCandidatesList);
        
        // Set up card animations
        const candidateCount = Math.max(jobSeekers.length, appliedCandidatesList.length);
        setCardIn(Array(candidateCount).fill(false));
        for (let i = 0; i < candidateCount; i++) {
          setTimeout(() => {
            setCardIn(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, 100 * i);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setAllCandidates([]);
        setAppliedCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getCurrentCandidates = () => {
    return selectedTab === 0 ? allCandidates : appliedCandidates;
  };

  const getApplicationInfo = (candidateId) => {
    const candidateApplications = applications.filter(app => app.jobSeekerId === candidateId);
    const jobTitles = candidateApplications.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return job ? job.title : 'Unknown Job';
    });
    return {
      count: candidateApplications.length,
      jobs: jobTitles,
      latestStatus: candidateApplications[0]?.status || 'Pending'
    };
  };

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
  const handleCVClick = (cvUrl) => {
    const fixedUrl = getCVUrl(cvUrl);
    if (fixedUrl) {
      window.open(fixedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseProfile = () => {
    setSelectedCandidate(null);
  };

  return (
    <Box className="candidates-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Navbar onLogout={handleLogout} position="absolute" />
      <Box sx={{ height: '64px' }} /> {/* Spacer for AppBar */}
      
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 4, px: { xs: 2, md: 4 } }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 700, fontFamily: 'Quicksand, sans-serif', textAlign: 'center' }}>
          Candidates
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
                fontFamily: 'Quicksand, sans-serif',
                '&.Mui-selected': {
                  color: '#1976d2',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
              },
            }}
          >
            <Tab label="All Candidates" />
            <Tab label="Applied Candidates" />
          </Tabs>
        </Box>
        
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          maxWidth: '100vw',
        }}>
          {loading ? (
            <Typography sx={{ mt: 4, textAlign: 'center', color: '#fff' }}>Loading candidates...</Typography>
          ) : getCurrentCandidates().length > 0 ? getCurrentCandidates().map((candidate, idx) => {
            const appInfo = selectedTab === 1 ? getApplicationInfo(candidate.id) : null;
            return (
              <Fade in={cardIn[idx]} timeout={600} key={candidate.id || idx}>
                <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2, p: 3, display: 'flex', alignItems: 'flex-start', minHeight: 160, width: '100%', maxWidth: 900 }}>
                  <Avatar
                    sx={{ width: 90, height: 90, mr: 3, mt: 1 }}
                    src={getProfilePicUrl(candidate.profilePictureUrl) || undefined}
                    alt={candidate.username}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2, mt:1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#004080' }}>
                        {candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : candidate.username}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, color: '#666', fontSize: '1rem' }}>
                        {candidate.email}
                      </Typography>
                      {candidate.location && (
                        <Chip 
                          label={candidate.location} 
                          size="small" 
                          sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                        />
                      )}
                    </Box>
                    
                    {/* Application Info for Applied Candidates */}
                    {selectedTab === 1 && appInfo && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.95rem', mb: 1 }}>
                          Application Status: <Chip label={appInfo.latestStatus} size="small" color={appInfo.latestStatus === 'Pending' ? 'warning' : 'success'} />
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                          Applied for: {appInfo.jobs.join(', ')}
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                          Total Applications: {appInfo.count}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography sx={{ mt: 1, color: '#444', fontSize: '1.05rem', mb: 2 }}>
                      {candidate.about || candidate.bio || 'Professional seeking new opportunities.'}
                    </Typography>
                    
                    {/* Experience Section */}
                    {candidate.experience && (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.95rem', mb: 1 }}>
                          Experience:
                        </Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                          {candidate.experience.length > 150 ? `${candidate.experience.substring(0, 150)}...` : candidate.experience}
                        </Typography>
                      </Box>
                    )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {candidate.resumeUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCVClick(candidate.resumeUrl)}
                        sx={{ 
                          borderColor: '#1976d2', 
                          color: '#1976d2',
                          '&:hover': { backgroundColor: '#e3f2fd' }
                        }}
                      >
                        View Resume
                      </Button>
                    )}
                    <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
                      Member since: {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {/* Show skills from the new skills field or fallback to default */}
                    {(candidate.skills ? candidate.skills.split(',').map(skill => skill.trim()) : ['Problem Solving', 'Communication', 'Team Work']).slice(0, 5).map((skill, i) => (
                      <Chip 
                        key={i} 
                        label={skill} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#bdbdbd', 
                          color: '#555', 
                          backgroundColor: '#f9f9f9',
                          fontWeight: 500
                        }}
                      />
                    ))}
                    {candidate.skills && candidate.skills.split(',').length > 5 && (
                      <Typography sx={{ ml: 1, color: '#888', fontSize: '0.95rem', alignSelf: 'center' }}>
                        +{candidate.skills.split(',').length - 5} more
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2, minWidth: 140 }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      fontWeight: 600, 
                      px: 2,
                      background: '#1976d2',
                      '&:hover': { background: '#1565c0' }
                    }}
                  >
                    Contact
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewProfile(candidate)}
                    sx={{ 
                      fontWeight: 600, 
                      px: 2,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
              </Card>
            </Fade>
            );
          }) : (
            <Typography sx={{ textAlign: 'center', mt: 4, color: '#fff' }}>
              {selectedTab === 0 ? 'No candidates found.' : 'No candidates have applied for your jobs yet.'}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfile 
          candidate={selectedCandidate} 
          onClose={handleCloseProfile} 
        />
      )}
    </Box>
  );
};

export default Candidates;
