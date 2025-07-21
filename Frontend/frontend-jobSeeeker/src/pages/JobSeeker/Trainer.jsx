// Trainer main page
import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { AppBar, Toolbar, Box, Button, Typography, Card, CardActions, Avatar, Rating, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider } from '@mui/material';
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
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTrainerClick = (trainer) => {
    setSelectedTrainer(trainer);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTrainer(null);
  };

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
              onClick={() => handleTrainerClick(trainer)}
              sx={{ 
                mb: 3, 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', 
                borderRadius: 3, 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                height: 120, // Fixed height
                width: '100%', 
                maxWidth: 800,
                transition: 'all 0.3s ease-in-out',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                }
              }}
              style={{ 
                animationDelay: `${idx * 150}ms`,
                transitionDelay: `${idx * 150}ms`
              }}
            >
              <Avatar
                sx={{ width: 60, height: 60, mr: 2 }}
                src={trainer.profilePictureUrl || undefined}
                alt={trainer.username}
              />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#004080', 
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {trainer.firstName && trainer.lastName ? `${trainer.firstName} ${trainer.lastName}` : trainer.username}
                </Typography>
                <Typography sx={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {trainer.expertise || 'NLP Expert'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '0.9rem' }}>
                    US${trainer.rate || 20} / 15 mins
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600, color: '#222', mr: 0.5, fontSize: '0.85rem' }}>
                      {trainer.rating || 5.0}
                    </Typography>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#ffd700"/>
                    </svg>
                    <Typography sx={{ color: '#888', fontSize: '0.8rem', ml: 0.5 }}>
                      ({trainer.reviewCount || 0})
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <CardActions sx={{ ml: 2 }}>
                <Button 
                  variant="contained" 
                  color="info" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    showInfo('Help Request Sent!', `You've requested help from ${trainer.firstName} ${trainer.lastName}. They will contact you soon.`);
                  }}
                  sx={{ 
                    fontWeight: 700, 
                    px: 2, 
                    py: 1,
                    fontSize: '0.8rem',
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

        {/* Trainer Details Modal */}
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2
            }
          }}
        >
          {selectedTrainer && (
            <>
              <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ width: 80, height: 80 }}
                  src={selectedTrainer.profilePictureUrl || undefined}
                  alt={selectedTrainer.username}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#004080' }}>
                    {selectedTrainer.firstName && selectedTrainer.lastName 
                      ? `${selectedTrainer.firstName} ${selectedTrainer.lastName}` 
                      : selectedTrainer.username}
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '1.1rem' }}>
                    {selectedTrainer.expertise || 'NLP Expert'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#222' }}>
                      US${selectedTrainer.rate || 20} / 15 mins
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600, color: '#222', mr: 0.5 }}>
                        {selectedTrainer.rating || 5.0}
                      </Typography>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#ffd700"/>
                      </svg>
                      <Typography sx={{ color: '#888', ml: 0.5 }}>
                        ({selectedTrainer.reviewCount || 0} reviews)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogTitle>
              
              <DialogContent sx={{ pt: 0 }}>
                <Divider sx={{ mb: 3 }} />
                
                {/* Bio Section */}
                {selectedTrainer.bio && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      About
                    </Typography>
                    <Typography sx={{ color: '#444', lineHeight: 1.6 }}>
                      {selectedTrainer.bio}
                    </Typography>
                  </Box>
                )}

                {/* Experience Section */}
                {selectedTrainer.experience && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      Experience
                    </Typography>
                    <Typography sx={{ color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {selectedTrainer.experience}
                    </Typography>
                  </Box>
                )}

                {/* Certifications Section */}
                {selectedTrainer.certifications && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      Certifications
                    </Typography>
                    <Typography sx={{ color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {selectedTrainer.certifications}
                    </Typography>
                  </Box>
                )}

                {/* Achievements Section */}
                {selectedTrainer.achievements && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      Achievements
                    </Typography>
                    <Typography sx={{ color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {selectedTrainer.achievements}
                    </Typography>
                  </Box>
                )}

                {/* Skills Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                    Skills & Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(selectedTrainer.skills || ['NLP', 'Python', 'Java', 'C++', 'C']).map((skill, i) => (
                      <Chip 
                        key={i} 
                        label={skill} 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#00b894', 
                          color: '#00b894',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 184, 148, 0.1)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                  onClick={handleCloseDetails}
                  sx={{ mr: 1, color: '#666' }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    showInfo('Help Request Sent!', `You've requested help from ${selectedTrainer.firstName} ${selectedTrainer.lastName}. They will contact you soon.`);
                    handleCloseDetails();
                  }}
                  sx={{ 
                    fontWeight: 700, 
                    px: 3,
                    background: 'linear-gradient(45deg, #00b894 30%, #00cec9 90%)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #00a085 30%, #00b7b3 90%)',
                    }
                  }}
                >
                  Request Help
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
    </>
  );
};

export default Trainer;
