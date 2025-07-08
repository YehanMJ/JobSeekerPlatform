import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { api } from '../../api';
import '../../App.css';
import "@fontsource/quicksand";
import Navbar from '../../components/Navbar';

const PostJobs = () => {
  const navigate = useNavigate();
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    jobTime: 'Full-Time',
    modality: 'Onsite',
    salary: '',
    category: '',
    requirements: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const employerId = sessionStorage.getItem('id');
      
      const jobData = {
        ...jobForm,
        employerId: parseInt(employerId),
        deadline: jobForm.deadline ? new Date(jobForm.deadline).toISOString() : null
      };

      await api.post('/jobs', jobData, {
        headers: { 
          Authorization: token ? `${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });

      setMessage('Job posted successfully!');
      // Reset form
      setJobForm({
        title: '',
        description: '',
        location: '',
        jobTime: 'Full-Time',
        modality: 'Onsite',
        salary: '',
        category: '',
        requirements: '',
        deadline: ''
      });
    } catch (err) {
      setMessage('Failed to post job. Please try again.');
      console.error('Job posting error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box className="post-jobs-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Navbar onLogout={handleLogout} position="sticky" />
      <Box sx={{ height: '64px' }} /> {/* Spacer for AppBar */}
      
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4, px: { xs: 2, md: 0 } }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 700, fontFamily: 'Quicksand, sans-serif', textAlign: 'center' }}>
          Post a New Job
        </Typography>
        
        <Card sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', p: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Job Title"
              value={jobForm.title}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="description"
              label="Job Description"
              value={jobForm.description}
              onChange={handleInputChange}
              required
              fullWidth
              multiline
              rows={4}
              margin="normal"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="location"
                label="Location"
                value={jobForm.location}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
              />
              
              <TextField
                name="salary"
                label="Salary"
                value={jobForm.salary}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="e.g., $50,000 - $70,000"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobTime"
                  value={jobForm.jobTime}
                  label="Job Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Full-Time">Full-Time</MenuItem>
                  <MenuItem value="Part-Time">Part-Time</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Work Mode</InputLabel>
                <Select
                  name="modality"
                  value={jobForm.modality}
                  label="Work Mode"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              name="category"
              label="Job Category"
              value={jobForm.category}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
              placeholder="e.g., Software Development, Marketing, Finance"
            />
            
            <TextField
              name="requirements"
              label="Requirements"
              value={jobForm.requirements}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              sx={{ mb: 2 }}
              placeholder="List the key requirements and qualifications"
            />
            
            <TextField
              name="deadline"
              label="Application Deadline"
              type="date"
              value={jobForm.deadline}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                background: '#1976d2',
                '&:hover': { background: '#1565c0' }
              }}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </form>
          
          {message && (
            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
                color: message.includes('success') ? 'green' : 'red',
                fontWeight: 600
              }}
            >
              {message}
            </Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default PostJobs;
