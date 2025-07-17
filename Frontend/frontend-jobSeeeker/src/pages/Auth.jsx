// Auth Page (Login & Register in one card)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Box, Paper, Typography, Tabs, Tab, TextField, Button, Checkbox, FormControlLabel, Divider, IconButton, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

// Animated Grid Background Component
const AnimatedGrid = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Grid properties
    const gridSize = 40;
    let offset = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines color
      ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = -gridSize + (offset % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = -gridSize + (offset % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Add glowing dots at intersections
      ctx.fillStyle = 'rgba(79, 195, 247, 0.6)';
      for (let x = -gridSize + (offset % gridSize); x < canvas.width; x += gridSize) {
        for (let y = -gridSize + (offset % gridSize); y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animate the offset for moving grid effect
      offset += 0.5;
      animationId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
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
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  position: 'relative',
};

const panelStyle = {
  fontFamily: 'Inconsolata, monospace',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 20,
  padding: '2rem 2.5rem',
  margin: '2rem 4rem',
  maxWidth: 400,
  width: '100%',
  color: '#333',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
  zIndex: 10,
  position: 'relative',
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
  const navigate = useNavigate();

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
      {/* Animated Grid Background */}
      <AnimatedGrid />
      
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
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            textColor="primary" 
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: tab === 0 ? '#4fc3f7' : '#00e676',
              }
            }}
          >
            <Tab 
              label="Sign in" 
              sx={{ 
                color: tab === 0 ? '#4fc3f7' : '#bdbdbd', 
                fontWeight: 600,
                '&:hover': {
                  color: '#4fc3f7',
                }
              }} 
            />
            <Tab 
              label="Sign up" 
              sx={{ 
                color: tab === 1 ? '#00e676' : '#bdbdbd', 
                fontWeight: 600,
                '&:hover': {
                  color: '#00e676',
                }
              }} 
            />
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
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                        background: 'transparent',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4fc3f7 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4fc3f7 !important',
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
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                        background: 'transparent',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4fc3f7 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4fc3f7 !important',
                      },
                    }
                  }}
                  InputLabelProps={{ style: { color: '#666' } }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.95rem' }}>
                  <FormControlLabel control={<Checkbox sx={{ color: '#4fc3f7' }} />} label={<span style={{ color: '#666' }}>Remember Me</span>} />
                  <span style={{ cursor: 'pointer', color: '#4fc3f7' }}>Forgot Password?</span>
                </Box>
                <Button type="submit" variant="contained" fullWidth sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: '#4fc3f7',
                  color: '#fff',
                  '&:hover': {
                    background: '#29b6f6'
                  }
                }}>
                  Login
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#666', mt: 1 }}>
                Don't have an account? <span style={{ color: '#00e676', cursor: 'pointer' }} onClick={() => setTab(1)}>Sign up</span>
              </Typography>
              <Divider sx={{ my: 1, bgcolor: '#ccc' }}>OR</Divider>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                <IconButton color="primary"><GoogleIcon /></IconButton>
                <IconButton color="primary"><FacebookIcon /></IconButton>
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
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                        background: 'transparent',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00e676 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00e676 !important',
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
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: 1,
                        '& input': {
                          color: '#333',
                          background: 'transparent',
                          borderRadius: 1,
                        },
                        '& fieldset': {
                          borderColor: 'rgba(120,120,120,0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00e676 !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00e676 !important',
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
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: 1,
                        '& input': {
                          color: '#333',
                          background: 'transparent',
                          borderRadius: 1,
                        },
                        '& fieldset': {
                          borderColor: 'rgba(120,120,120,0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00e676 !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00e676 !important',
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
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                        background: 'transparent',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00e676 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00e676 !important',
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
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      '& input': {
                        color: '#333',
                        background: 'transparent',
                        borderRadius: 1,
                      },
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00e676 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00e676 !important',
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
                      background: 'rgba(255,255,255,0.9)', 
                      borderRadius: 1,
                      '& fieldset': {
                        borderColor: 'rgba(120,120,120,0.5) !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00e676 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00e676 !important',
                      },
                    }}
                    inputProps={{
                      sx: {
                        color: '#333',
                        background: 'transparent',
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
                    sx={{ mb: 2, color: '#333', borderColor: '#00e676', fontWeight: 600, '&:hover': { borderColor: '#00c853' } }}
                  >
                    Upload Resume (PDF)
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleResumeChange}
                    />
                    {resume && <span style={{ marginLeft: 8, fontSize: '0.95em', color: '#00e676' }}>{resume.name}</span>}
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
                        background: 'rgba(255,255,255,0.9)', 
                        borderRadius: 1,
                        '& fieldset': {
                          borderColor: 'rgba(120,120,120,0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00e676 !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00e676 !important',
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
                        background: 'rgba(255,255,255,0.9)', 
                        borderRadius: 1,
                        '& fieldset': {
                          borderColor: 'rgba(120,120,120,0.5) !important',
                        },
                        '&:hover fieldset': {
                          borderColor: '#00e676 !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00e676 !important',
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
                  background: '#00e676',
                  color: '#fff',
                  '&:hover': {
                    background: '#00c853'
                  }
                }}>
                  Register
                </Button>
              </form>
              <Typography align="center" sx={{ color: '#666', mt: 1 }}>
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
