import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent, CardActions, TextField, MenuItem, InputAdornment, Select, FormControl, InputLabel, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/Navbar';
import { api } from '../api';

const jobTypes = ['Full-Time', 'Part-Time', 'Internship', 'Contract'];
const modalities = ['Onsite', 'Remote', 'Hybrid'];
const countries = ['Sri Lanka', 'India', 'Remote', 'Other'];
const salaries = ['< $500', '$500 - $1000', '$1000 - $2000', '$2000+'];

const Filter = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ title: '', location: '', company: '', jobType: '', modality: '', country: '', salary: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/jobs', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setJobs([]);
      } finally {
        setLoading(false);
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
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

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
    <Box className="filter-container" sx={{ minHeight: '100vh', position: 'relative', background: '#111', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Navbar position="sticky" />
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 6, mb: 2, px: { xs: 2, md: 0 } }}>
        <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Quicksand, sans-serif', mb: 3, color: '#fff', lineHeight: 1.1 }}>
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
              sx={{ flex: 2, bgcolor: '#f7f7f7', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#b0b0b0' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Anywhere"
              name="location"
              value={filter.location}
              onChange={handleFilterChange}
              size="medium"
              sx={{ flex: 1, bgcolor: '#f7f7f7', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: '#b0b0b0' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" sx={{ bgcolor: '#ff6a22', color: '#fff', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#ff6a22' } }}>
              Search
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel>Job Type</InputLabel>
              <Select label="Job Type" name="jobType" value={filter.jobType} onChange={handleFilterChange}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {jobTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel>Modality</InputLabel>
              <Select label="Modality" name="modality" value={filter.modality} onChange={handleFilterChange}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {modalities.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel>Country</InputLabel>
              <Select label="Country" name="country" value={filter.country} onChange={handleFilterChange}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {countries.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#f7f7f7', borderRadius: 2 }}>
              <InputLabel>Salary</InputLabel>
              <Select label="Salary" name="salary" value={filter.salary} onChange={handleFilterChange}>
                <MenuItem value=""><em>Any</em></MenuItem>
                {salaries.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClear} sx={{ color: '#ff6a22', fontWeight: 600, textTransform: 'none', ml: 'auto' }} endIcon={<ClearIcon fontSize="small" />}>Clear</Button>
          </Box>
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#fff', fontFamily: 'Quicksand, sans-serif', mb: 2 }}>
          {filteredJobs.length} total jobs
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
          {loading ? (
            <Typography sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', mt: 4 }}>Loading jobs...</Typography>
          ) : filteredJobs.length > 0 ? filteredJobs.map((job, idx) => {
            const employerUser = users.find(u => u.id === job.employerId);
            let postedDate = job.createdAt ? new Date(job.createdAt) : null;
            let postedStr = postedDate ? postedDate.toLocaleDateString('en-GB') : '';
            return (
              <Card key={job.id} sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', p: 0, overflow: 'visible', minWidth: 320 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, pb: 0 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: '#f7f7f7', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Company logo placeholder */}
                    <img src={employerUser && employerUser.logoUrl ? employerUser.logoUrl : '/vite.svg'} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#222', fontFamily: 'Quicksand, sans-serif', mb: 0.2 }}>
                      {job.title}
                    </Typography>
                    <Typography sx={{ color: '#1bbf72', fontWeight: 600, fontSize: '1rem', fontFamily: 'Quicksand, sans-serif', mb: 0.2 }}>
                      {employerUser ? employerUser.companyName : 'Company Name'}
                    </Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.98rem', fontFamily: 'Quicksand, sans-serif', mb: 0.2 }}>
                      {job.category || 'Category'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" sx={{ color: '#888' }}><ShareOutlinedIcon fontSize="small" /></IconButton>
                      <Button size="small" sx={{ color: '#ff6a22', fontWeight: 700, textTransform: 'none', pl: 0.5, pr: 0.5 }} endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}>
                        Apply
                      </Button>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ pt: 1, pb: 1, px: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', color: '#888', fontSize: '0.97rem', fontFamily: 'Quicksand, sans-serif' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 500 }}>{job.jobTime || 'Full-Time'}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#eee' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: '#b0b0b0' }} />
                      <Typography>{job.location || 'N/A'}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#eee' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography>{job.salary || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ px: 2, pb: 1, textAlign: 'right', color: '#888', fontSize: '0.93rem', fontFamily: 'Quicksand, sans-serif' }}>
                  Posted on {postedStr}
                </Box>
              </Card>
            );
          }) : (
            <Typography sx={{ color: '#fff', fontFamily: 'Quicksand, sans-serif', mt: 4 }}>No jobs found.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Filter;
