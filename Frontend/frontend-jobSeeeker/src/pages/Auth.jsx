// Auth Page (Login & Register in one card)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Box, Paper, Typography, Tabs, Tab, TextField, Button, Checkbox, FormControlLabel, Divider, IconButton, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Globe from 'react-globe.gl';
import mapBg from '../assets/p4.PNG';
import LoadingScreen from '../components/LoadingScreen';

// Component for animated circular waves
const CircularWave = ({ x, y, delay, onComplete }) => {
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0.8);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScale(prev => {
          if (prev >= 3) {
            // Reset animation and trigger new random position
            setOpacity(0.8);
            onComplete();
            return 0;
          }
          return prev + 0.03;
        });
        setOpacity(prev => {
          if (scale >= 2.5) {
            return Math.max(0, prev - 0.02);
          }
          return Math.max(0, 0.8 - scale * 0.3);
        });
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [scale, delay, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: '80px',
        height: '80px',
        border: '2px solid rgba(79, 195, 247, 0.6)',
        borderRadius: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: opacity,
        pointerEvents: 'none',
        transition: 'all 0.05s ease-out',
        zIndex: 1,
      }}
    />
  );
};

// Generate random wave positions
const generateWaves = () => {
  const waves = [];
  for (let i = 0; i < 12; i++) {
    waves.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 20000 + 5000, // 5-25 seconds delay
    });
  }
  return waves;
};

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
  backgroundImage: `url(${mapBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    zIndex: 0,
  }
};

const panelStyle = {
  fontFamily: 'Inconsolata, monospace',
  background: 'rgba(255, 255, 255, 0)',
  borderRadius: 20,
  padding: '2rem 2.5rem',
  margin: '2rem 4rem',
  maxWidth: 400,
  width: '100%',
  color: '#333',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
  zIndex: 10,
  position: 'relative',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

function Auth() {
  const [tab, setTab] = useState(0); // 0 = login, 1 = register
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: '' 
  });
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState(null);
  const [expertise, setExpertise] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [currentWave, setCurrentWave] = useState(null);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const globeRef = useRef();

  // Generate a single wave
  const generateNewWave = () => {
    return {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2000 + 1000, // 1-3 seconds delay
    };
  };

  // Initialize first wave
  useEffect(() => {
    if (!isWaveActive) {
      setCurrentWave(generateNewWave());
      setIsWaveActive(true);
    }
  }, [isWaveActive]);

  // Function to regenerate a new wave after current one completes
  const regenerateWave = () => {
    setIsWaveActive(false);
    setTimeout(() => {
      setCurrentWave(generateNewWave());
      setIsWaveActive(true);
    }, Math.random() * 3000 + 2000); // 2-5 seconds delay between waves
  };

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
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
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
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
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
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
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
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
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
    <Box sx={{ ...bgStyle, position: 'relative', overflow: 'hidden' }}>
      {/* Light overlay for map background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(240, 248, 255, 0.85)',
          zIndex: 0,
        }}
      />
      
      {/* Animated circular waves - Only one at a time */}
      {isWaveActive && currentWave && (
        <CircularWave
          key={currentWave.id}
          x={currentWave.x}
          y={currentWave.y}
          delay={currentWave.delay}
          onComplete={regenerateWave}
        />
      )}
      
      {/* Title at top left */}
      <Typography
        variant="h3"
        sx={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
          color: '#2196f3',
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: '0 2px 16px #0d0d1a, 0 1px 1px #222',
          fontFamily: 'Inconsolata, monospace',
        }}
      >
        Job Seekers
      </Typography>
      
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Paper elevation={8} sx={panelStyle}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Sign in" sx={{ color: '#333', fontWeight: 600 }} />
            <Tab label="Sign up" sx={{ color: '#333', fontWeight: 600 }} />
          </Tabs>
          {tab === 0 ? (
            <>
              <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>
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
                      color: '#333',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
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
                      color: '#333',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.95rem' }}>
                  <FormControlLabel control={<Checkbox sx={{ color: '#2196f3' }} />} label={<span style={{ color: '#666' }}>Remember Me</span>} />
                  <span style={{ cursor: 'pointer', color: '#2196f3' }}>Forgot Password?</span>
                </Box>
                <Button type="submit" variant="contained" fullWidth sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: '#2196f3',
                  color: '#fff',
                  '&:hover': {
                    background: '#1976d2'
                  }
                }}>
                  Login
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#666', mt: 1 }}>
                Don't have an account? <span style={{ color: '#2196f3', cursor: 'pointer' }} onClick={() => setTab(1)}>Sign up</span>
              </Typography>
              <Divider sx={{ my: 1, bgcolor: '#ccc' }}>OR</Divider>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                <IconButton sx={{ color: '#2196f3' }}><GoogleIcon /></IconButton>
                <IconButton sx={{ color: '#2196f3' }}><FacebookIcon /></IconButton>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>
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
                      color: '#333',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={registerForm.firstName}
                    onChange={handleRegisterChange}
                    required
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    InputProps={{
                      sx: {
                        color: '#333',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 1,
                        '& input': {
                          color: '#333',
                        },
                        '& fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.8) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3 !important',
                        },
                      }
                    }}
                    InputLabelProps={{ style: { color: '#666' } }}
                  />
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={registerForm.lastName}
                    onChange={handleRegisterChange}
                    required
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                    InputProps={{
                      sx: {
                        color: '#333',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 1,
                        '& input': {
                          color: '#333',
                        },
                        '& fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.8) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3 !important',
                        },
                      }
                    }}
                    InputLabelProps={{ style: { color: '#666' } }}
                  />
                </Box>
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
                      color: '#333',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
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
                      color: '#333',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#666' }}>Role</InputLabel>
                  <Select
                    name="role"
                    value={registerForm.role}
                    label="Role"
                    onChange={handleRegisterChange}
                    required
                    sx={{ 
                      color: '#333', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: 1,
                      '& fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(33, 150, 243, 0.8) !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3 !important',
                      },
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
                    sx={{ mb: 2, color: '#2196f3', borderColor: '#2196f3', fontWeight: 600 }}
                  >
                    Upload Resume (PDF)
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleResumeChange}
                    />
                    {resume && <span style={{ marginLeft: 8, fontSize: '0.95em', color: '#2196f3' }}>{resume.name}</span>}
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
                    InputProps={{ 
                      sx: { 
                        color: '#333', 
                        background: 'rgba(255, 255, 255, 0.8)', 
                        borderRadius: 1,
                        '& fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.8) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3 !important',
                        },
                      } 
                    }}
                    InputLabelProps={{ style: { color: '#666' } }}
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
                    InputProps={{ 
                      sx: { 
                        color: '#333', 
                        background: 'rgba(255, 255, 255, 0.8)', 
                        borderRadius: 1,
                        '& fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(33, 150, 243, 0.8) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2196f3 !important',
                        },
                      } 
                    }}
                    InputLabelProps={{ style: { color: '#666' } }}
                    sx={{ mb: 2 }}
                  />
                )}
                <Button type="submit" variant="contained" fullWidth sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: '#2196f3',
                  color: '#fff',
                  '&:hover': {
                    background: '#1976d2'
                  }
                }}>
                  Register
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#666', mt: 1 }}>
                Already have an account? <span style={{ color: '#2196f3', cursor: 'pointer' }} onClick={() => setTab(0)}>Sign in</span>
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
