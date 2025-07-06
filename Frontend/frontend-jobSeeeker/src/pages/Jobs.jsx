// Job Seeker main page
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, CardActions } from '@mui/material';
import { api } from '../api';
import '../App.css';
import "@fontsource/quicksand";
import ProfileButton from '../components/ProfileButton';
import Navbar from '../components/Navbar';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        timer = setTimeout(() => setLoading(false), 1000);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box className="jobs-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
      {loading && (
        <div className="bubble-loader">
          <div className="bubble-spinner">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
          </div>
        </div>
      )}
      <Navbar onLogout={handleLogout} position="absolute" />
      <Box sx={{ height: '64px' }} /> {/* Spacer for AppBar */}
      <Box sx={{
        width: '100%',
        mt: 8,
        px: { xs: 2, md: 8 },
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        maxWidth: '100vw',
      }}>
        {!loading && jobs.length > 0 ? jobs.map((job, idx) => {
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
            <Card
              key={job.id}
              className="job-card-custom job-card-animate"
              sx={{
                minWidth: 280,
                maxWidth: 340,
                flex: '1 1 300px',
                p: 0,
                animationDelay: `${idx * 80}ms`,
              }}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Days left */}
              <span className="job-daysleft">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{marginRight:4}}><path d="M12 8v5l3 2" stroke="#888" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="1.7"/></svg>
                {daysLeft !== null ? `${daysLeft} days left` : 'Open'}
              </span>
              {/* Job type badge */}
              <span className="job-badge">{jobType}</span>
              <CardContent sx={{ pt: 7, pb: 1, px: 2, textAlign: 'center', flex: 1 }}>
                <Typography sx={{ color: '#888', fontWeight: 500, fontSize: '1.05rem', mt: 1, mb: 0.5, fontFamily: 'Quicksand, sans-serif' }}>{employerUser ? employerUser.companyName : 'Company Name'}</Typography>
                <Typography variant="h6" sx={{ color: '#222', fontWeight: 700, fontFamily: 'Quicksand, sans-serif', fontSize: '1.18rem', mb: 0.5 }}>{job.title}</Typography>
                <Typography sx={{ color: '#b0b0b0', fontSize: '1.01rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Quicksand, sans-serif', mb: 1 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#b0b0b0"/></svg>
                  {job.location || 'N/A'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 1 }}>
                <Button size="medium" variant="outlined" className="job-apply-btn">Apply Now</Button>
              </CardActions>
            </Card>
          );
        }) : (!loading && (
          <Typography sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', mt: 4 }}>No jobs found.</Typography>
        ))}
      </Box>
    </Box>
  );
};

export default Jobs;
