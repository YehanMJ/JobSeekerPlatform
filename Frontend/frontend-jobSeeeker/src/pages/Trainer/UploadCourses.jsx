import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Card, CardContent, IconButton, Chip, Alert, MenuItem } from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { api } from '../../api';

const UploadCourses = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    level: '',
    category: '',
    prerequisites: [],
    modules: []
  });
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newModule, setNewModule] = useState({ title: '', description: '', duration: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourseData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const handleRemovePrerequisite = (index) => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setNewModule(prev => ({ ...prev, [name]: value }));
  };

  const handleAddModule = () => {
    if (newModule.title.trim() && newModule.description.trim()) {
      setCourseData(prev => ({
        ...prev,
        modules: [...prev.modules, { ...newModule, id: Date.now() }]
      }));
      setNewModule({ title: '', description: '', duration: '' });
    }
  };

  const handleRemoveModule = (id) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const trainerId = parseInt(sessionStorage.getItem('id'));

      const payload = {
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration,
        level: courseData.level,
        category: courseData.category,
        prerequisites: courseData.prerequisites,
        modules: courseData.modules.map(module => ({
          title: module.title,
          description: module.description,
          duration: module.duration
        })),
        trainerId: trainerId,
        createdAt: new Date().toISOString()
      };

      const response = await api.post('/courses', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Course created successfully:', response.data);
      
      setSuccess(true);
      setCourseData({
        title: '',
        description: '',
        duration: '',
        level: '',
        category: '',
        prerequisites: [],
        modules: []
      });
      
      setTimeout(() => {
        navigate('/trainer/home');
      }, 2000);

    } catch (err) {
      console.error('Error uploading course:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to upload course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('id');
    navigate('/auth');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <Navbar onLogout={handleLogout} position="sticky" />
      
      <Box sx={{ pt: 10, px: 3, pb: 3 }}>
        <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1e3c72', textAlign: 'center' }}>
            Upload New Course
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Course uploaded successfully! Redirecting to dashboard...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e3c72' }}>
                  Course Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Description"
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Duration (hours)"
                  name="duration"
                  type="number"
                  value={courseData.duration}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Level"
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  required
                  select
                  variant="outlined"
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>
                  </MenuItem>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                  required
                  select
                  variant="outlined"
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>
                  </MenuItem>
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="AI/ML">AI/ML</MenuItem>
                  <MenuItem value="Cloud Computing">Cloud Computing</MenuItem>
                  <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              {/* Prerequisites */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e3c72' }}>
                  Prerequisites
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Prerequisite"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisite()}
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddPrerequisite}
                    startIcon={<Add />}
                    sx={{ minWidth: 120 }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {courseData.prerequisites.map((prereq, index) => (
                    <Chip
                      key={index}
                      label={prereq}
                      onDelete={() => handleRemovePrerequisite(index)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Modules */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e3c72' }}>
                  Course Modules
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Add New Module
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Module Title"
                        name="title"
                        value={newModule.title}
                        onChange={handleModuleChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Duration (hours)"
                        name="duration"
                        type="number"
                        value={newModule.duration}
                        onChange={handleModuleChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleAddModule}
                        startIcon={<Add />}
                        sx={{ height: '40px' }}
                      >
                        Add Module
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Module Description"
                        name="description"
                        value={newModule.description}
                        onChange={handleModuleChange}
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* Module List */}
                {courseData.modules.map((module) => (
                  <Card key={module.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#777', mb: 1 }}>
                          {module.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#555' }}>
                          Duration: {module.duration} hours
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleRemoveModule(module.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/trainer/home')}
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<CloudUpload />}
                    sx={{ 
                      minWidth: 150,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
                    }}
                  >
                    {loading ? 'Uploading...' : 'Upload Course'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default UploadCourses;
