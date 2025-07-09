import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, CardActions, CircularProgress, Snackbar, Alert } from '@mui/material';
import pp1 from '../../assets/pp1.jpeg';
import pp2 from '../../assets/pp2.jpg';
import pp3 from '../../assets/pp3.jpg';
import pp4 from '../../assets/pp4.jpeg';
import pp6 from '../../assets/pp6.avif';
import { api } from '../../api';
import '../../App.css';
import "@fontsource/quicksand";
import ProfileButton from '../../components/ProfileButton';
import Navbar from '../../components/Navbar';

const images = [pp6, pp2, pp3];

const Home = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/jobs', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        if (Array.isArray(res.data)) {
          // Sort by id descending, take last 20
          const sorted = [...res.data].sort((a, b) => b.id - a.id).slice(0, 20);
          setJobs(sorted);
        }
      } catch (err) {
        setJobs([]);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/user/all', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        if (Array.isArray(res.data)) {
            console.log(res.data);
          setUsers(res.data);
        }
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = sessionStorage.getItem('id');
        
        if (!userId) return;

        const res = await api.get('/applications', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        
        if (Array.isArray(res.data)) {
          // Filter applications by current user and create a set of applied job IDs
          const userApplications = res.data.filter(app => app.jobSeekerId === parseInt(userId));
          const appliedJobIds = new Set(userApplications.map(app => app.jobId));
          setAppliedJobs(appliedJobIds);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    // Show loading spinner for 1.5s on mount
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleApplyJob = async (jobId) => {
    try {
      // Check if already applied
      if (appliedJobs.has(jobId)) {
        setSnackbar({
          open: true,
          message: 'You have already applied for this job',
          severity: 'warning'
        });
        return;
      }

      setApplyingJobId(jobId);
      const token = localStorage.getItem('token');
      const userId = sessionStorage.getItem('id');
      
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'Please log in to apply for jobs',
          severity: 'error'
        });
        return;
      }

      // Check if user is a jobseeker
      const userRes = await api.get('/user/userauth', {
        headers: { Authorization: token ? `${token}` : undefined },
        params: { id: userId }
      });

      if (userRes.data.role !== 'jobseeker') {
        setSnackbar({
          open: true,
          message: 'Only job seekers can apply for jobs',
          severity: 'error'
        });
        return;
      }

      // Create application
      const applicationData = {
        jobId: jobId,
        jobSeekerId: parseInt(userId),
        status: 'Pending'
      };

      const response = await api.post('/applications', applicationData, {
        headers: { Authorization: token ? `${token}` : undefined }
      });

      if (response.status === 201) {
        // Add job to applied jobs set
        setAppliedJobs(prev => new Set([...prev, jobId]));
        
        setSnackbar({
          open: true,
          message: 'Application submitted successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: 'Please log in to apply for jobs',
          severity: 'error'
        });
      } else if (error.response?.status === 409) {
        setSnackbar({
          open: true,
          message: 'You have already applied for this job',
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to submit application. Please try again.',
          severity: 'error'
        });
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box className="home-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Prevent body scroll on x-axis */}
      <style>{`
        body { overflow-x: hidden !important; }
        .bubble-loader {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(20, 20, 30, 0.95);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .bubble-spinner {
          display: flex; gap: 0.5rem;
        }
        .bubble {
          width: 18px; height: 18px; border-radius: 50%;
          background: #ffd700;
          opacity: 0.8;
          animation: bubble-bounce 1s infinite alternate;
        }
        .bubble:nth-child(2) { animation-delay: 0.2s; }
        .bubble:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bubble-bounce {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-18px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.7; }
        }
      `}</style>
      {loading && (
        <div className="bubble-loader">
          <div className="bubble-spinner">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
          </div>
        </div>
      )}
      {!loading && (
        <>
          <Box sx={{ position: 'relative', width: '100%', height: '50vh', zIndex: 0, overflow: 'hidden' }}>
            {images.map((img, idx) => {
              // Always slide left, even when wrapping from last to first
              let offset = idx - current;
              if (offset < -1) offset += images.length;
              if (offset > 1) offset -= images.length;
              return (
                <img
                  key={idx}
                  src={img}
                  alt={`slide-${idx}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
                    transform: `translateX(${100 * offset}%)`,
                    opacity: idx === current ? 1 : 0,
                    zIndex: idx === current ? 1 : 0,
                  }}
                />
              );
            })}
            <Navbar onLogout={handleLogout} position="sticky" />
          </Box>
          <Box className="home-content" sx={{
            position: 'absolute',
            top: 180, // fixed distance from top, keeps box in place
            left: '50%',
            transform: 'translateX(-50%)', // only horizontal centering
            zIndex: 3,
            width: { xs: '90%', sm: '70%', md: '50%' },
            bgcolor: 'rgba(80,80,80,0.5)',
            textAlign: 'center',
            color: '#fff',
            p: 3,
            m: 0,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            fontFamily: 'Quicksand, sans-serif',
          }}>
            <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 700, fontFamily: 'Quicksand, sans-serif', fontSize: '3rem' }}>
              Welcome to the Job Seeker Platform!
            </Typography>
            <Typography sx={{ color: '#ffffff !important', fontSize: '2.1rem !important', fontFamily: 'Quicksand, sans-serif' }}>
              Your future career starts here.
            </Typography>
          </Box>
          {/* Recent Jobs Section */}
          <Box sx={{
            width: '100%',
            mt: 6,
            px: { xs: 2, md: 8 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            maxWidth: '100vw',
          }}>
            <style>{`
              .job-card-custom {
                border-radius: 18px !important;
                box-shadow: 0 4px 16px 0 rgba(31,38,135,0.10) !important;
                background: #fff !important;
                padding: 0 !important;
                position: relative;
                overflow: visible;
                min-height: 280px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .job-badge {
                position: absolute;
                top: 18px;
                right: 18px;
                background: #e6f7f2;
                color: #00b894;
                font-size: 0.95rem;
                font-weight: 600;
                border-radius: 16px;
                padding: 4px 14px;
                z-index: 2;
              }
              .job-daysleft {
                position: absolute;
                top: 18px;
                left: 18px;
                display: flex;
                align-items: center;
                color: #888;
                font-size: 0.97rem;
                font-weight: 500;
                background: #f7f7f7;
                border-radius: 14px;
                padding: 3px 10px 3px 8px;
                z-index: 2;
                gap: 4px;
              }
              .job-company-logo {
                width: 60px;
                height: 60px;
                object-fit: contain;
                margin: 0 auto 10px auto;
                display: block;
                border-radius: 8px;
                background: #f5f5f5;
                border: 1px solid #eee;
              }
              .job-apply-btn {
                border-radius: 22px !important;
                border: 1.5px solid #ff4d4f !important;
                color: #ff4d4f !important;
                font-weight: 600 !important;
                width: 80%;
                margin: 0 auto 18px auto !important;
                display: block !important;
                background: #fff !important;
                transition: background 0.2s;
              }
              .job-apply-btn:hover {
                background: #fff0f0 !important;
                border-color: #ff7875 !important;
              }
              .job-card-animate {
                opacity: 0;
                transform: translateY(30px);
                animation: fadeInUp 0.7s forwards;
              }
              @keyframes fadeInUp {
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            {jobs.length > 0 ? jobs.map((job, idx) => {
              // Calculate days left (if job.deadline exists)
              let daysLeft = null;
              if (job.deadline) {
                const deadline = new Date(job.deadline);
                const now = new Date();
                daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
              }
              // Job type badge (default: Full-time Job)
              const jobType = job.jobTime || 'Full-time Job';
              // Find user by employerId
              const employerUser = users.find(u => u.id === job.employerId);
              return (
                <Card key={job.id} className="job-card-custom job-card-animate" sx={{ minWidth: 280, maxWidth: 340, flex: '1 1 300px', p: 0, animationDelay: `${idx * 80}ms` }} style={{ animationDelay: `${idx * 80}ms` }}>
                  {/* Days left */}
                  <span className="job-daysleft">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{marginRight:4}}><path d="M12 8v5l3 2" stroke="#888" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="1.7"/></svg>
                    {daysLeft !== null ? `${daysLeft} days left` : 'Open'}
                  </span>
                  {/* Job type badge */}
                  <span className="job-badge">{jobType}</span>
                  <CardContent sx={{ pt: 7, pb: 1, px: 2, textAlign: 'center', flex: 1 }}>
                    {/* Removed logo image here */}
                    <Typography sx={{ color: '#888', fontWeight: 500, fontSize: '1.05rem', mt: 1, mb: 0.5, fontFamily: 'Quicksand, sans-serif' }}>{employerUser ? employerUser.companyName : 'Company Name'}</Typography>
                    <Typography variant="h6" sx={{ color: '#222', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', fontSize: '1.18rem', mb: 0.5 }}>{job.title}</Typography>
                    <Typography sx={{ color: '#b0b0b0', fontSize: '1.01rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Quicksand, sans-serif', mb: 1 }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#b0b0b0"/></svg>
                      {job.location || 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 1 }}>
                    <Button 
                      size="medium" 
                      variant={appliedJobs.has(job.id) ? "contained" : "outlined"}
                      className="job-apply-btn"
                      onClick={() => handleApplyJob(job.id)}
                      disabled={applyingJobId === job.id || appliedJobs.has(job.id)}
                      sx={{
                        ...(appliedJobs.has(job.id) && {
                          backgroundColor: '#4caf50 !important',
                          borderColor: '#4caf50 !important',
                          color: '#fff !important',
                          '&:hover': {
                            backgroundColor: '#45a049 !important',
                            borderColor: '#45a049 !important',
                          }
                        })
                      }}
                    >
                      {applyingJobId === job.id ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Applying...
                        </>
                      ) : appliedJobs.has(job.id) ? (
                        'Applied ✓'
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              );
            }) : (
              <Typography sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', mt: 4 }}>No recent jobs found.</Typography>
            )}
          </Box>
        </>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
