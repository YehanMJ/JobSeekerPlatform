// Job Seeker main page
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, CardActions, TextField, MenuItem, InputAdornment, Select, FormControl, InputLabel, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import { api } from '../../api';
import '../../App.css';
import "@fontsource/quicksand";
import ProfileButton from '../../components/ProfileButton';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';

const jobTypes = ['Full-Time', 'Part-Time', 'Internship', 'Contract'];
const modalities = ['Onsite', 'Remote', 'Hybrid'];
const countries = ['Sri Lanka', 'India', 'Remote', 'Other'];
const salaries = ['< $500', '$500 - $1000', '$1000 - $2000', '$2000+'];

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ title: '', location: '', company: '', jobType: '', modality: '', country: '', salary: '' });
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    let timer;
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/jobs', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        if (Array.isArray(res.data)) {
          setJobs(res.data);
        }
      } catch (err) {
        setJobs([]);
      } finally {
        // Ensure loader is visible for at least 1 second
        timer = setTimeout(() => setLoading(false), 2000);
      }
    };
    fetchJobs();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/user/all', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        if (Array.isArray(res.data)) {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = sessionStorage.getItem('id');
      
      if (!userId) {
        alert('Please log in to apply for jobs');
        return;
      }

      if (appliedJobs.has(jobId)) {
        alert('You have already applied to this job');
        return;
      }

      const applicationData = {
        jobId: jobId,
        jobSeekerId: parseInt(userId),
        status: 'Applied'
      };

      await api.post('/applications', applicationData, {
        headers: { 
          Authorization: token ? `${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });

      // Update the applied jobs set
      setAppliedJobs(prev => new Set([...prev, jobId]));
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setFilter({ title: '', location: '', company: '', jobType: '', modality: '', country: '', salary: '' });
  };

  const filteredJobs = jobs.filter(job => {
    const employerUser = users.find(u => u.id === job.employerId);
    return (
      (!filter.title || job.title.toLowerCase().includes(filter.title.toLowerCase())) &&
      (!filter.location || (job.location && job.location.toLowerCase().includes(filter.location.toLowerCase()))) &&
      (!filter.company || (employerUser && employerUser.companyName && employerUser.companyName.toLowerCase().includes(filter.company.toLowerCase()))) &&
      (!filter.jobType || (job.jobTime && job.jobTime === filter.jobType)) &&
      (!filter.modality || (job.modality && job.modality === filter.modality)) &&
      (!filter.country || (job.location && job.location.includes(filter.country))) &&
      (!filter.salary || (job.salary && job.salary === filter.salary))
    );
  });

  return (
    <Box className="jobs-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(252, 252, 252) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
      {loading && <LoadingScreen />}
      <Navbar onLogout={handleLogout} position="absolute" />
      <Box sx={{ height: '64px' }} /> {/* Spacer for AppBar */}
      
      {/* Filter Section */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 6, mb: 2, px: { xs: 2, md: 0 } }}>
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Quicksand, sans-serif', mb: 3, color: '#333', lineHeight: 1.1 }}>
          Find your dream job or let<br />companies find you
        </Typography>
        <Box sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', p: { xs: 2, md: 3 }, mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Job title or keywords"
              name="title"
              value={filter.title}
              onChange={handleFilterChange}
              size="medium"
              sx={{ flex: 2, bgcolor: '#f7f7f7', borderRadius: 2, fontFamily: 'Quicksand, sans-serif' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#b0b0b0' }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: 'Quicksand, sans-serif' }
              }}
            />
            <TextField
              placeholder="Anywhere"
              name="location"
              value={filter.location}
              onChange={handleFilterChange}
              size="medium"
              sx={{ flex: 1, bgcolor: '#f7f7f7', borderRadius: 2, fontFamily: 'Quicksand, sans-serif' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: '#b0b0b0' }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: 'Quicksand, sans-serif' }
              }}
            />
            <Button variant="contained" sx={{ bgcolor: '#ff6a22', color: '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, boxShadow: 'none', fontFamily: 'Quicksand, sans-serif', '&:hover': { bgcolor: '#ff6a22' } }}>
              Search
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel sx={{ fontFamily: 'Quicksand, sans-serif' }}>Job Type</InputLabel>
              <Select label="Job Type" name="jobType" value={filter.jobType} onChange={handleFilterChange} sx={{ fontFamily: 'Quicksand, sans-serif' }}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {jobTypes.map(type => <MenuItem key={type} value={type} sx={{ fontFamily: 'Quicksand, sans-serif' }}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel sx={{ fontFamily: 'Quicksand, sans-serif' }}>Modality</InputLabel>
              <Select label="Modality" name="modality" value={filter.modality} onChange={handleFilterChange} sx={{ fontFamily: 'Quicksand, sans-serif' }}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {modalities.map(type => <MenuItem key={type} value={type} sx={{ fontFamily: 'Quicksand, sans-serif' }}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel sx={{ fontFamily: 'Quicksand, sans-serif' }}>Country</InputLabel>
              <Select label="Country" name="country" value={filter.country} onChange={handleFilterChange} sx={{ fontFamily: 'Quicksand, sans-serif' }}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {countries.map(type => <MenuItem key={type} value={type} sx={{ fontFamily: 'Quicksand, sans-serif' }}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel sx={{ fontFamily: 'Quicksand, sans-serif' }}>Salary</InputLabel>
              <Select label="Salary" name="salary" value={filter.salary} onChange={handleFilterChange} sx={{ fontFamily: 'Quicksand, sans-serif' }}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {salaries.map(type => <MenuItem key={type} value={type} sx={{ fontFamily: 'Quicksand, sans-serif' }}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClear} sx={{ color: '#ff6a22', fontWeight: 600, textTransform: 'none', ml: 'auto', fontFamily: 'Quicksand, sans-serif' }} endIcon={<ClearIcon fontSize="small" />}>Clear</Button>
          </Box>
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#333', fontFamily: 'Quicksand, sans-serif', mb: 2 }}>
          {filteredJobs.length} total jobs
        </Typography>
      </Box>
      <Box sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        mt: 2,
        px: { xs: 2, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
        {!loading && filteredJobs.length > 0 ? filteredJobs.map((job, idx) => {
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
          
          // Company logo and initial variables
          const companyName = employerUser?.companyName || 'Company Name';
          const companyLogoUrl = getCompanyLogoUrl(employerUser?.companyLogoUrl);
          const hasLogo = companyLogoUrl && companyLogoUrl !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMiIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjAgMTBIMTJWMzBIMjhWMThaIiBmaWxsPSIjNjU2Qzc2Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjU2Qzc2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
          const companyInitial = getCompanyInitial(companyName);
          const randomColor = getRandomColor(companyName);
          return (
            <Card
              key={job.id}
              className="job-card-custom job-card-animate"
              sx={{
                width: '100%',
                p: 0,
                animationDelay: `${idx * 80}ms`,
              }}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Header with logo and actions */}
              <Box className="job-card-header">
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                  <Box 
                    className="job-company-logo"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#656c76',
                      overflow: 'hidden'
                    }}
                  >
                    {hasLogo ? (
                      <img 
                        src={companyLogoUrl} 
                        alt={companyName} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Box sx={{ 
                      display: hasLogo ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      backgroundColor: randomColor,
                      color: 'white',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {companyInitial}
                    </Box>
                    {hasLogo && (
                      <Box sx={{ 
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        backgroundColor: randomColor,
                        color: 'white',
                        fontFamily: 'Quicksand, sans-serif',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {companyInitial}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="job-title">
                      {job.title}
                    </Typography>
                    <Typography className="job-company-name">
                      {companyName}
                    </Typography>
                    <Box className="job-meta-info">
                      <Box className="job-meta-item">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>{job.location || 'N/A'}</span>
                      </Box>
                      <span>•</span>
                      <Box className="job-meta-item">
                        <span>{job.jobTime || 'Full-time'}</span>
                      </Box>
                      {job.modality && (
                        <>
                          <span>•</span>
                          <Box className="job-meta-item">
                            <span>{job.modality}</span>
                          </Box>
                        </>
                      )}
                      {daysLeft !== null && (
                        <>
                          <span>•</span>
                          <Box className="job-meta-item">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" fill="none"/>
                            </svg>
                            <span>{daysLeft} days left</span>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Button
                    className={`job-apply-btn-header ${appliedJobs.has(job.id) ? 'applied' : ''}`}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job.id);
                    }}
                    disabled={appliedJobs.has(job.id)}
                  >
                    {appliedJobs.has(job.id) ? 'Applied' : 'Apply'}
                  </Button>
                </Box>
              </Box>
              {job.description && (
                <Typography sx={{ 
                  color: '#656c76', 
                  fontSize: '14px', 
                  lineHeight: 1.4, 
                  margin: '12px 0',
                  padding: '0 16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontFamily: 'Quicksand, sans-serif'
                }}>
                  {job.description}
                </Typography>
              )}
              <Typography className="job-posted-time" sx={{ padding: '0 16px 16px 16px' }}>
                Posted recently
              </Typography>
            </Card>
          );
        }) : (!loading && (
          <Typography sx={{ color: '#333', fontFamily: 'Quicksand, sans-serif', mt: 4 }}>No jobs found.</Typography>
        ))}
      </Box>
    </Box>
  );
};

export default Jobs;
