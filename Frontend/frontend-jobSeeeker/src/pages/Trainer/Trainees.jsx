import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button, Chip, LinearProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Email, Phone, School, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

const Trainees = () => {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const token = localStorage.getItem('token');
        const trainerId = sessionStorage.getItem('id');
        
        if (!trainerId) {
          console.error('Trainer ID not found in session storage.');
          setLoading(false);
          return;
        }

        // Fetch actual trainees from enrollment API
        const enrollmentsRes = await api.get(`/enrollments/trainer/${trainerId}`, {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        
        if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
          // Process enrollments to create trainees data
          const traineesData = enrollmentsRes.data.map(enrollment => ({
            id: enrollment.jobSeekerId,
            name: enrollment.jobSeekerName || 'Unknown Student',
            email: 'N/A', // Email not available in enrollment data
            phone: 'N/A', // Phone not available in enrollment data
            course: enrollment.courseTitle || 'Unknown Course',
            progress: enrollment.progress || 0,
            status: enrollment.status === 'ENROLLED' ? 'Active' : 
                   enrollment.status === 'COMPLETED' ? 'Completed' : 
                   enrollment.status,
            enrolledDate: enrollment.enrollmentDate ? 
              new Date(enrollment.enrollmentDate).toISOString().split('T')[0] : 'N/A',
            lastActivity: 'N/A', // Not available in current data
            profilePicture: null,
            completedModules: Math.floor((enrollment.progress || 0) / 10), // Estimated
            totalModules: 10 // Default assumption
          }));
          
          setTrainees(traineesData);
          setFilteredTrainees(traineesData);
        } else {
          setTrainees([]);
          setFilteredTrainees([]);
        }
      } catch (err) {
        console.error('Error fetching trainees:', err);
        setTrainees([]);
        setFilteredTrainees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  useEffect(() => {
    const filtered = trainees.filter(trainee =>
      trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrainees(filtered);
  }, [searchTerm, trainees]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('id');
    navigate('/auth');
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'primary';
      case 'Inactive': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <Navbar onLogout={handleLogout} position="sticky" />
      
      <Box sx={{ pt: 10, px: 3, pb: 3 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e3c72' }}>
            My Trainees
          </Typography>
          <Typography sx={{ color: '#777', mb: 3 }}>
            Manage and track your students' progress
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search by name, course, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Paper>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Total Trainees
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {trainees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Active Students
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {trainees.filter(t => t.status === 'Active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Completed
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {trainees.filter(t => t.status === 'Completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Avg. Progress
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {trainees.length > 0 ? Math.round(trainees.reduce((sum, t) => sum + t.progress, 0) / trainees.length) : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trainees List */}
        <Grid container spacing={3}>
          {filteredTrainees.map((trainee) => (
            <Grid item xs={12} md={6} lg={4} key={trainee.id}>
              <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={trainee.profilePicture}
                      sx={{ width: 60, height: 60, mr: 2, bgcolor: '#667eea' }}
                    >
                      {trainee.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {trainee.name}
                      </Typography>
                      <Chip 
                        label={trainee.status} 
                        color={getStatusColor(trainee.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Course Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {trainee.course}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777', mb: 2 }}>
                      Enrolled: {new Date(trainee.enrolledDate).toLocaleDateString()}
                    </Typography>
                    
                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {trainee.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={trainee.progress} 
                        color={getProgressColor(trainee.progress)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" sx={{ color: '#777', mt: 0.5 }}>
                        {trainee.completedModules} of {trainee.totalModules} modules completed
                      </Typography>
                    </Box>
                  </Box>

                  {/* Contact Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#777', mb: 1 }}>
                      <Email sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                      {trainee.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777' }}>
                      <Phone sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                      {trainee.phone}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ 
                        flexGrow: 1,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': { borderColor: '#5a6fd8', color: '#5a6fd8' }
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      sx={{ 
                        flexGrow: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
                      }}
                    >
                      Contact
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredTrainees.length === 0 && (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ color: '#777' }}>
              No trainees found matching your search.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Trainees;
