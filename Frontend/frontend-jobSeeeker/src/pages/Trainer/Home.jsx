import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../api';
import LoadingScreen from '../../components/LoadingScreen';

const TrainerHome = () => {
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = sessionStorage.getItem('id');
        
        if (!userId) {
          console.error('User ID not found in session storage.');
          setLoading(false);
          return;
        }

        // Fetch trainer profile
        const trainerRes = await api.get('/user/userauth', {
          headers: { Authorization: token ? `${token}` : undefined },
          params: { id: userId }
        });
        setTrainer(trainerRes.data);

        // Fetch courses created by this trainer
        const coursesRes = await api.get('/courses', {
          headers: { Authorization: token ? `${token}` : undefined }
        });
        
        // Filter courses by trainer ID
        const trainerCourses = coursesRes.data.filter(course => course.trainerId === parseInt(userId));
        setCourses(trainerCourses);

        // Fetch actual trainees from enrollment API
        try {
          const enrollmentsRes = await api.get(`/enrollments/trainer/${userId}`, {
            headers: { Authorization: token ? `${token}` : undefined }
          });
          
          if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
            // Process enrollments to create trainees data
            const traineesData = enrollmentsRes.data.map(enrollment => ({
              id: enrollment.jobSeekerId,
              name: enrollment.jobSeekerName || 'Unknown Student',
              course: enrollment.courseTitle || 'Unknown Course',
              progress: enrollment.progress || 0,
              status: enrollment.status || 'ENROLLED',
              enrollmentDate: enrollment.enrollmentDate
            }));
            setTrainees(traineesData);
          } else {
            setTrainees([]);
          }
        } catch (enrollmentErr) {
          console.error('Error fetching enrollments:', enrollmentErr);
          // Fallback to empty array if enrollment API fails
          setTrainees([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        // Add 2-second delay for loading screen
        setTimeout(() => setLoading(false), 2000);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('id');
    navigate('/auth');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <Navbar onLogout={handleLogout} position="sticky" />
      
      <Box sx={{ pt: 10, px: 3, pb: 3 }}>
        {/* Welcome Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e3c72' }}>
            Welcome back, {trainer?.firstName && trainer?.lastName ? `${trainer.firstName} ${trainer.lastName}` : trainer?.username}!
          </Typography>
          <Typography variant="h6" sx={{ color: '#555', mb: 1 }}>
            Trainer Dashboard
          </Typography>
          <Typography sx={{ color: '#777' }}>
            Expertise: {trainer?.expertise || 'General Training'}
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Total Courses
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {courses.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>
                  Total Students
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e3c72' }}>
                  {trainees.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
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

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e3c72' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  py: 2, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
                }}
                onClick={() => navigate('/trainer/upload-courses')}
              >
                Upload New Course
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  py: 2, 
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#1e3c72',
                  '&:hover': { background: 'linear-gradient(135deg, #e6c200 0%, #e6d645 100%)' }
                }}
                onClick={() => navigate('/trainer/trainees')}
              >
                View Trainees
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  py: 2, 
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': { borderColor: '#5a6fd8', color: '#5a6fd8' }
                }}
              >
                Schedule Session
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  py: 2, 
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': { borderColor: '#5a6fd8', color: '#5a6fd8' }
                }}
              >
                View Analytics
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Courses */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e3c72' }}>
            My Courses
          </Typography>
          <Grid container spacing={3}>
            {courses.length > 0 ? courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {course.title}
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 1 }}>
                      Category: {course.category}
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 1 }}>
                      Level: {course.level}
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 2 }}>
                      Duration: {course.duration} hours
                    </Typography>
                    <Chip 
                      label={course.category} 
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <Button 
                      variant="text" 
                      fullWidth 
                      sx={{ color: '#667eea' }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography sx={{ color: '#777', textAlign: 'center', py: 4 }}>
                  No courses created yet. Upload your first course to get started!
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Recent Trainees */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e3c72' }}>
            Recent Students
          </Typography>
          <Grid container spacing={3}>
            {trainees.length > 0 ? trainees.slice(0, 6).map((trainee) => (
              <Grid item xs={12} md={6} lg={4} key={trainee.id}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {trainee.name}
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 1 }}>
                      Course: {trainee.course}
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 1 }}>
                      Progress: {trainee.progress}%
                    </Typography>
                    <Typography sx={{ color: '#777', mb: 1 }}>
                      Status: {trainee.status}
                    </Typography>
                    {trainee.enrollmentDate && (
                      <Typography sx={{ color: '#999', fontSize: '0.875rem' }}>
                        Enrolled: {new Date(trainee.enrollmentDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography sx={{ color: '#777', textAlign: 'center', py: 4 }}>
                  No students enrolled in your courses yet. Create engaging courses to attract learners!
                </Typography>
              </Grid>
            )}
            {trainees.length > 6 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    sx={{ color: '#667eea', borderColor: '#667eea' }}
                    onClick={() => navigate('/trainer/trainees')}
                  >
                    View All Students ({trainees.length})
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default TrainerHome;
