// Trainer main page
import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { AppBar, Toolbar, Box, Button, Typography, Card, CardActions, Avatar, Rating, Fade } from '@mui/material';
import '../../App.css';
import "@fontsource/quicksand";
import ProfileButton from '../../components/ProfileButton';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import LoadingScreen from '../../components/LoadingScreen';
import { showSuccess, showError, showInfo } from '../../utils/notifications';

const Trainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIn, setCardIn] = useState([]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await api.get('/user/all');
        const trainers = res.data.filter(u => u.role === 'trainer');
        setTrainers(trainers);
        setCardIn(Array(trainers.length).fill(false));
        trainers.forEach((_, i) => {
          setTimeout(() => {
            setCardIn(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, 100 * i);
        });
        
        // Show success notification when trainers are loaded
        showSuccess('Trainers Loaded!', `Found ${trainers.length} available trainers`);
      } catch (err) {
        setTrainers([]);
        showError('Loading Failed', 'Unable to load trainers. Please try again.');
      } finally {
        // Add 2-second delay for loading screen
        setTimeout(() => setLoading(false), 2000);
      }
    };
    fetchTrainers();
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <Box className="jobs-container" sx={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(252, 252, 252) 100%)', overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Navbar onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} position="absolute" />
      <Box sx={{ height: '64px' }} /> {/* Spacer for AppBar */}
      <Box sx={{
        width: '100%',
        mt: 8,
        px: { xs: 2, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        maxWidth: '100vw',
      }}>
        <style>{`
          .trainer-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
          }
          .trainer-card.animate-in {
            opacity: 1;
            transform: translateY(0);
          }
          .trainer-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          }
        `}</style>
        {trainers.length > 0 ? trainers.map((trainer, idx) => (
          <Fade in={cardIn[idx]} timeout={800} key={trainer.id || idx}>
            <Card 
              className={`trainer-card ${cardIn[idx] ? 'animate-in' : ''}`}
              sx={{ 
                mb: 3, 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', 
                borderRadius: 3, 
                p: 2, 
                display: 'flex', 
                alignItems: 'flex-start', 
                minHeight: 140, 
                width: '100%', 
                maxWidth: 800,
                transition: 'all 0.3s ease-in-out',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
              style={{ 
                animationDelay: `${idx * 150}ms`,
                transitionDelay: `${idx * 150}ms`
              }}
            >
              <Avatar
                sx={{ width: 80, height: 80, mr: 3, mt: 1 }}
                src={trainer.profilePictureUrl || undefined}
                alt={trainer.username}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Link href={'#'} underline="hover" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#004080', mr: 1 }}>
                    {trainer.firstName && trainer.lastName ? `${trainer.firstName} ${trainer.lastName}` : trainer.username}
                  </Link>
                  <Typography sx={{ fontWeight: 500, color: '#222', mr: 1 }}>
                    US${trainer.rate || 20} / 15 mins
                  </Typography>
                  <span style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                    <span style={{ fontWeight: 600, color: '#222', marginRight: 2 }}>{trainer.rating || 5.0}</span>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#ffd700"/></svg>
                    <span style={{ color: '#888', fontSize: '0.95rem', marginLeft: 2 }}>({trainer.reviewCount || 0} reviews)</span>
                  </span>
                  <Typography sx={{ color: '#222', fontWeight: 600, fontSize: '1.01rem', mr: 1 }}>
                    {trainer.expertise || 'NLP Expert'}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 1, color: '#444', fontSize: '1.05rem' }}>
                  {trainer.bio || 'No bio available.'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(trainer.skills || ['NLP', 'Python', 'Java', 'C++', 'C']).slice(0, 6).map((skill, i) => (
                    <Button key={i} size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5, py: 0.2, fontSize: '0.95em', borderRadius: 2, borderColor: '#bdbdbd', color: '#222', fontWeight: 500, textTransform: 'none', background: '#f7f7f7', mr: 1 }}>{skill}</Button>
                  ))}
                  {trainer.skills && trainer.skills.length > 6 && (
                    <Typography sx={{ ml: 1, color: '#888', fontSize: '0.95rem' }}>+{trainer.skills.length - 6}</Typography>
                  )}
                </Box>
              </Box>
              <CardActions sx={{ flexDirection: 'column', alignItems: 'flex-end', ml: 2, minWidth: 120 }}>
                <Button 
                  variant="contained" 
                  color="info" 
                  onClick={() => {
                    showInfo('Help Request Sent!', `You've requested help from ${trainer.firstName} ${trainer.lastName}. They will contact you soon.`);
                  }}
                  sx={{ 
                    fontWeight: 700, 
                    px: 3, 
                    mb: 1, 
                    background: 'linear-gradient(45deg, #00b894 30%, #00cec9 90%)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #00a085 30%, #00b7b3 90%)',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  GET HELP
                </Button>
              </CardActions>
            </Card>
          </Fade>
        )) : !loading && (
          <Typography sx={{ textAlign: 'center', mt: 4, color: '#666' }}>No trainers found.</Typography>
        )}
      </Box>
    </Box>
    </>
  );
};

export default Trainer;
