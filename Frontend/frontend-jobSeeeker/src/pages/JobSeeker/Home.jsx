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
import LoadingScreen from '../../components/LoadingScreen';

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
    <Box className="home-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(252, 252, 252) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Prevent body scroll on x-axis */}
      <style>{`
        body { overflow-x: hidden !important; }
      `}</style>
      {loading && <LoadingScreen message="Loading jobs..." />}
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
            maxWidth: 1200,
            mx: 'auto',
            mt: 6,
            px: { xs: 2, md: 2 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Quicksand, sans-serif', mb: 2, color: '#333', textAlign: 'center' }}>
              Recent Jobs
            </Typography>
            <style>{`
              .job-card-custom {
                border: 1px solid #d0d7de !important;
                border-radius: 12px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
                background: #fff !important;
                padding: 0 !important;
                position: relative;
                overflow: hidden;
                min-height: 220px;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                cursor: pointer;
                margin-bottom: 8px;
                font-family: 'Quicksand', sans-serif !important;
                transform: translateY(0);
              }
              .job-card-custom:hover {
                box-shadow: 0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1) !important;
                border-color: #9ca3af;
                transform: translateY(-4px) scale(1.01);
                background: #fafbfc !important;
              }
              .job-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 16px;
                padding: 16px 16px 0 16px;
              }
              .job-company-logo {
                width: 40px;
                height: 40px;
                object-fit: contain;
                border-radius: 2px;
                background: #fff;
                border: 1px solid #d0d7de;
                padding: 2px;
                flex-shrink: 0;
              }
              .job-apply-btn-header {
                background: #0969da;
                border: 1px solid #0969da;
                color: white;
                cursor: pointer;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                font-family: 'Quicksand', sans-serif;
                transition: all 0.2s ease;
                text-transform: none;
              }
              .job-apply-btn-header:hover {
                background: #0860ca;
                border-color: #0860ca;
              }
              .job-apply-btn-header.applied {
                background: #1a7f37;
                border-color: #1a7f37;
                color: white;
              }
              .job-apply-btn-header.applied:hover {
                background: #116329;
                border-color: #116329;
              }
              .job-title {
                font-size: 16px !important;
                font-weight: 600 !important;
                color: #0969da !important;
                margin: 0 0 4px 0 !important;
                line-height: 1.3;
                text-decoration: none;
                cursor: pointer;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-family: 'Quicksand', sans-serif !important;
              }
              .job-title:hover {
                text-decoration: underline;
              }
              .job-company-name {
                font-size: 14px !important;
                color: #1f2328 !important;
                font-weight: 500 !important;
                margin: 0 0 4px 0 !important;
                font-family: 'Quicksand', sans-serif !important;
              }
              .job-meta-info {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #656c76;
                font-size: 12px;
                margin: 4px 0 12px 0;
                flex-wrap: wrap;
                font-family: 'Quicksand', sans-serif;
              }
              .job-meta-item {
                display: flex;
                align-items: center;
                gap: 3px;
              }
              .job-posted-time {
                color: #656c76;
                font-size: 12px;
                margin-top: 12px;
                font-family: 'Quicksand', sans-serif;
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
              const jobType = job.jobTime || 'Full-time';
              // Find user by employerId
              const employerUser = users.find(u => u.id === job.employerId);
              const employer = employers.find(e => e.userId === job.employerId);
              
              // Helper function to get correct company logo URL
              const getCompanyLogoUrl = (url) => {
                if (!url) return undefined;
                // Handle different URL formats
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url;
                } else if (url.startsWith('/uploads')) {
                  return `http://localhost:8080${url}`;
                } else {
                  return `http://localhost:8080/uploads/company-logos/${url}`;
                }
              };

              // Helper function to generate random color for company initial
              const getRandomColor = (companyName) => {
                if (!companyName) return '#6366f1';
                const colors = [
                  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
                ];
                const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                return colors[hash % colors.length];
              };

              // Helper function to get company initial
              const getCompanyInitial = (companyName) => {
                if (!companyName) return 'C';
                return companyName.charAt(0).toUpperCase();
              };

              const companyName = employerUser?.companyName || 'Company Name';
              const companyLogoUrl = getCompanyLogoUrl(employerUser?.companyLogoUrl);
              const hasLogo = companyLogoUrl && companyLogoUrl !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMiIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjAgMTBIMTJWMzBIMjhWMThaIiBmaWxsPSIjNjU2Qzc2Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjU2Qzc2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
              const companyInitial = getCompanyInitial(companyName);
              const randomColor = getRandomColor(companyName);
              
              return (
                <Card key={job.id} className="job-card-custom job-card-animate" sx={{ 
                  width: '100%', 
                  maxWidth: 1200, 
                  mx: 'auto',
                  p: 0, 
                  animationDelay: `${idx * 80}ms`,
                  marginBottom: 2
                }} style={{ animationDelay: `${idx * 80}ms` }}>
                  {/* Header with logo and apply button */}
                  <div className="job-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {hasLogo ? (
                        <img 
                          src={companyLogoUrl} 
                          alt="Company Logo" 
                          className="job-company-logo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div 
                          className="job-company-logo"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: randomColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Quicksand, sans-serif'
                          }}
                        >
                          {companyInitial}
                        </div>
                      )}
                      {hasLogo && (
                        <div 
                          className="job-company-logo"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: randomColor,
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Quicksand, sans-serif'
                          }}
                        >
                          {companyInitial}
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 className="job-title">{job.title}</h3>
                          <span style={{ 
                            backgroundColor: '#e6f7f2', 
                            color: '#00b894', 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            fontFamily: 'Quicksand, sans-serif'
                          }}>{jobType}</span>
                        </div>
                        <p className="job-company-name">
                          {employerUser?.companyName || 'Company Name'}
                        </p>
                        <div className="job-meta-info">
                          <div className="job-meta-item">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#656c76"/>
                            </svg>
                            <span>{job.location || 'N/A'}</span>
                          </div>
                          <span>•</span>
                          <div className="job-meta-item">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                              <path d="M12 8v5l3 2" stroke="#656c76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="9" stroke="#656c76" strokeWidth="1.5"/>
                            </svg>
                            <span>{daysLeft !== null ? `${daysLeft} days left` : 'Open'}</span>
                          </div>
                          {job.salary && (
                            <>
                              <span>•</span>
                              <div className="job-meta-item">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#656c76" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>{job.salary}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="small" 
                      variant="contained"
                      className={`job-apply-btn-header ${appliedJobs.has(job.id) ? 'applied' : ''}`}
                      onClick={() => handleApplyJob(job.id)}
                      disabled={applyingJobId === job.id || appliedJobs.has(job.id)}
                    >
                      {applyingJobId === job.id ? (
                        <>
                          <CircularProgress size={14} sx={{ mr: 1, color: 'white' }} />
                          Applying...
                        </>
                      ) : appliedJobs.has(job.id) ? (
                        'Applied ✓'
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </div>
                  
                  {/* Job Content */}
                  <CardContent sx={{ pt: 0, pb: 2, px: 2 }}>
                    {/* Job Description */}
                    <div style={{ 
                      marginBottom: '12px', 
                      color: '#656c76', 
                      fontSize: '14px', 
                      lineHeight: '1.5',
                      fontFamily: 'Quicksand, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.description || 'No description available'}
                    </div>
                    
                    {/* Job Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {job.category && (
                        <span style={{ 
                          backgroundColor: '#f0f9ff', 
                          color: '#0284c7', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          padding: '4px 8px', 
                          borderRadius: '16px',
                          fontFamily: 'Quicksand, sans-serif'
                        }}>{job.category}</span>
                      )}
                      {job.modality && (
                        <span style={{ 
                          backgroundColor: '#f0fdf4', 
                          color: '#16a34a', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          padding: '4px 8px', 
                          borderRadius: '16px',
                          fontFamily: 'Quicksand, sans-serif'
                        }}>{job.modality}</span>
                      )}
                    </div>
                    
                    {/* Posted Time */}
                    <div className="job-posted-time">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <Typography sx={{ color: '#666', fontFamily: 'Quicksand, sans-serif', mt: 4, textAlign: 'center' }}>No recent jobs found.</Typography>
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
