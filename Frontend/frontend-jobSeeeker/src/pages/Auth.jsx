// Auth Page (Login & Register in one card)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Box, Paper, Typography, Tabs, Tab, TextField, Button, Checkbox, FormControlLabel, Divider, IconButton, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Globe from 'react-globe.gl';
import p3 from '../assets/p3.jpg';

const bgStyle = {
  fontFamily: 'Inconsolata, monospace',
  minHeight: '100vh',
  minWidth: '100vw',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
};

const panelStyle = {
  fontFamily: 'Inconsolata, monospace',
  background: 'rgba(20, 20, 20, 0.7)',
  borderRadius: 20,
  padding: '2rem 2.5rem',
  margin: '2rem 4rem',
  maxWidth: 400,
  width: '100%',
  color: '#fff',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

function Auth() {
  const [tab, setTab] = useState(0); // 0 = login, 1 = register
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', role: '' });
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState(null);
  const [expertise, setExpertise] = useState('');
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();
  const globeRef = useRef();

  useEffect(() => {
    let animationFrameId;
    let angle = 0;
    const animate = () => {
      angle += 0.1;
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: 0, lng: angle }, 0);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handlers for login
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/user/login', {
        username: loginForm.username,
        password: loginForm.password
      });
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        console.log('Login successful:', res.data);
        sessionStorage.setItem('id', res.data.id || '');
        sessionStorage.setItem('role', res.data.role || '');
        setMessage('Login successful!');
        // Redirect based on role
        if (res.data.role === 'employer') {
          navigate('/employer/home');
        } else if(res.data.role === 'trainer') {
          navigate('/trainer/home');
        } else {
          navigate('/home');
        }
      } else {
        setMessage('Login failed: No token received.');
      }
    } catch (err) {
      setMessage('Login failed.');
    }
  };

  // Handlers for register
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    if (e.target.name === 'role') {
      setResume(null);
      setExpertise('');
      setCompanyName('');
    }
  };
  const handleResumeChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    let endpoint = '/user/register';
    if (registerForm.role === 'jobseeker') endpoint = '/job-seekers';
    else if (registerForm.role === 'trainer') endpoint = '/trainers';
    else if (registerForm.role === 'employer') endpoint = '/employers';
    try {
      let payload;
      let config = {};
      if (registerForm.role === 'jobseeker') {
        // Backend expects jobSeeker (JSON blob) and file (PDF)
        if (!resume) {
          setMessage('Please upload your resume (PDF).');
          return;
        }
        payload = new FormData();
        const jobSeekerObj = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role
        };
        payload.append(
          'jobSeeker',
          new Blob([JSON.stringify(jobSeekerObj)], { type: 'application/json' })
        );
        // Ensure file is appended as a PDF
        const pdfFile = new File([resume], resume.name, { type: 'application/pdf' });
        payload.append('file', pdfFile);
        // Do NOT set Content-Type for FormData; browser will handle it
        await api.post(endpoint, payload);
      } else if (registerForm.role === 'trainer') {
        payload = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role,
          expertise: expertise
        };
        config = { headers: { 'Content-Type': 'application/json' } };
        await api.post(endpoint, payload, config);
      } else if (registerForm.role === 'employer') {
        if (!companyName) {
          setMessage('Please enter your company name.');
          return;
        }
        payload = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role,
          company: companyName  // Changed from companyName to company
        };
        config = { headers: { 'Content-Type': 'application/json' } };
        await api.post(endpoint, payload, config);
      } else if (registerForm.role === 'admin') {
        payload = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role
        };
        config = { headers: { 'Content-Type': 'application/json' } };
        await api.post(endpoint, payload, config);
      }
      setMessage('Registration successful!');
      setTab(0);
    } catch (err) {
      setMessage('Registration failed.');
    }
  };

  return (
    <Box sx={{ ...bgStyle, background: '#0d0d1a', fontFamily: 'Inconsolata, monospace', position: 'relative', overflow: 'hidden' }}>
      {/* Title at top left */}
      <Typography
        variant="h3"
        sx={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
          color: '#4fc3f7',
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: '0 2px 16px #0d0d1a, 0 1px 1px #222',
          fontFamily: 'Inconsolata, monospace',
        }}
      >
        Job Seekers
      </Typography>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundColor="#0d0d1a"
          animateIn={true}
          backgroundImageUrl={p3}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Paper elevation={8} sx={panelStyle}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Sign in" sx={{ color: '#4fc3f7', fontWeight: 600 }} />
            <Tab label="Sign up" sx={{ color: '#4fc3f7', fontWeight: 600 }} />
          </Tabs>
          {tab === 0 ? (
            <>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                Welcome back! Please login to your account
              </Typography>
              <form onSubmit={handleLoginSubmit} autoComplete="off">
                <TextField
                  name="username"
                  label="Email or Username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: 'rgba(10,10,10,0.85)',
                      borderRadius: 1,
                      '& input': {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(80,80,80,0.7) !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#bdbdbd' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: 'rgba(10,10,10,0.85)',
                      borderRadius: 1,
                      '& input': {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(80,80,80,0.7) !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#bdbdbd' } }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#bdbdbd', fontSize: '0.95rem' }}>
                  <FormControlLabel control={<Checkbox sx={{ color: '#4fc3f7' }} />} label={<span style={{ color: '#bdbdbd' }}>Remember Me</span>} />
                  <span style={{ cursor: 'pointer', color: '#4fc3f7' }}>Forgot Password?</span>
                </Box>
                <Button type="submit" variant="contained" fullWidth sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: 'rgba(10,10,10,0.95)',
                  color: '#fff',
                  '&:hover': {
                    background: 'rgba(30,30,30,1)'
                  }
                }}>
                  Login
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#bdbdbd', mt: 1 }}>
                Don't have an account? <span style={{ color: '#4fc3f7', cursor: 'pointer' }} onClick={() => setTab(1)}>Sign up</span>
              </Typography>
              <Divider sx={{ my: 1, bgcolor: '#bdbdbd' }}>OR</Divider>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                <IconButton color="primary"><GoogleIcon /></IconButton>
                <IconButton color="primary"><FacebookIcon /></IconButton>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                Create your account
              </Typography>
              <form onSubmit={handleRegisterSubmit} autoComplete="off">
                <TextField
                  name="username"
                  label="Username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: 'rgba(10,10,10,0.85)',
                      borderRadius: 1,
                      '& input': {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(80,80,80,0.7) !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#bdbdbd' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="off"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: 'rgba(10,10,10,0.85)',
                      borderRadius: 1,
                      '& input': {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(80,80,80,0.7) !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#bdbdbd' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: 'rgba(10,10,10,0.85)',
                      borderRadius: 1,
                      '& input': {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(80,80,80,0.7) !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#bdbdbd' } }}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#bdbdbd' }}>Role</InputLabel>
                  <Select
                    name="role"
                    value={registerForm.role}
                    label="Role"
                    onChange={handleRegisterChange}
                    required
                    sx={{ color: '#fff', background: 'rgba(10,10,10,0.85)', borderRadius: 1 }}
                    inputProps={{
                      sx: {
                        color: '#fff',
                        background: 'rgba(10,10,10,0.85)',
                        borderRadius: 1,
                      }
                    }}
                  >
                    <MenuItem value="" disabled>Select a role</MenuItem>
                    <MenuItem value="jobseeker">Job Seeker</MenuItem>
                    <MenuItem value="employer">Employer</MenuItem>
                    <MenuItem value="trainer">Trainer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                {registerForm.role === 'jobseeker' && (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2, color: '#fff', borderColor: '#4fc3f7', fontWeight: 600 }}
                  >
                    Upload Resume (PDF)
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleResumeChange}
                    />
                    {resume && <span style={{ marginLeft: 8, fontSize: '0.95em', color: '#4fc3f7' }}>{resume.name}</span>}
                  </Button>
                )}
                {registerForm.role === 'trainer' && (
                  <TextField
                    name="expertise"
                    label="Expertise"
                    value={expertise}
                    onChange={e => setExpertise(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{ sx: { color: '#fff', background: 'rgba(10,10,10,0.85)', borderRadius: 1 } }}
                    InputLabelProps={{ style: { color: '#bdbdbd' } }}
                    sx={{ mb: 2 }}
                  />
                )}
                {registerForm.role === 'employer' && (
                  <TextField
                    name="companyName"
                    label="Company Name"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{ sx: { color: '#fff', background: 'rgba(10,10,10,0.85)', borderRadius: 1 } }}
                    InputLabelProps={{ style: { color: '#bdbdbd' } }}
                    sx={{ mb: 2 }}
                  />
                )}
                <Button type="submit" variant="contained" fullWidth sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: 'rgba(10,10,10,0.95)',
                  color: '#fff',
                  '&:hover': {
                    background: 'rgba(30,30,30,1)'
                  }
                }}>
                  Register
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#bdbdbd', mt: 1 }}>
                Already have an account? <span style={{ color: '#4fc3f7', cursor: 'pointer' }} onClick={() => setTab(0)}>Sign in</span>
              </Typography>
            </>
          )}
          {message && <Typography color={message.includes('success') ? 'primary' : 'error'} align="center">{message}</Typography>}
        </Paper>
      </Box>
    </Box>
  );
}

export default Auth;
