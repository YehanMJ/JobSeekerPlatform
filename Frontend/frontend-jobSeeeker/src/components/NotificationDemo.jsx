import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Stack
} from '@mui/material';
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showLoading, 
  showConfirmation,
  closeAllNotifications 
} from '../utils/notifications';

const NotificationDemo = () => {
  const handleSuccessDemo = () => {
    showSuccess('Success!', 'This is a success notification with custom styling.');
  };

  const handleErrorDemo = () => {
    showError('Error!', 'This is an error notification that appears in the top right corner.');
  };

  const handleWarningDemo = () => {
    showWarning('Warning!', 'This is a warning notification with beautiful animations.');
  };

  const handleInfoDemo = () => {
    showInfo('Information', 'This is an info notification matching your app colors.');
  };

  const handleLoadingDemo = () => {
    showLoading('Loading your data...');
    // Auto close after 3 seconds for demo
    setTimeout(() => {
      closeAllNotifications();
      showSuccess('Complete!', 'Loading finished successfully.');
    }, 3000);
  };

  const handleConfirmationDemo = () => {
    showConfirmation(
      'Are you sure?',
      'This is a confirmation dialog with custom styling.',
      'Yes, I\'m sure!',
      'Cancel'
    ).then((result) => {
      if (result.isConfirmed) {
        showSuccess('Confirmed!', 'You clicked the confirm button.');
      } else if (result.isDismissed) {
        showInfo('Cancelled', 'You cancelled the action.');
      }
    });
  };

  const handleCloseAll = () => {
    closeAllNotifications();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: '#2d3436',
            fontWeight: 700
          }}
        >
          SweetAlert2 Notification Demo
        </Typography>
        
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            color: '#636e72'
          }}
        >
          Click the buttons below to see custom notifications in action!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Button
                variant="contained"
                onClick={handleSuccessDemo}
                sx={{
                  background: 'linear-gradient(45deg, #00b894 30%, #00cec9 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00a085 30%, #00b7b3 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Success Notification
              </Button>

              <Button
                variant="contained"
                onClick={handleErrorDemo}
                sx={{
                  background: 'linear-gradient(45deg, #e74c3c 30%, #c0392b 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #c0392b 30%, #a93226 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Error Notification
              </Button>

              <Button
                variant="contained"
                onClick={handleWarningDemo}
                sx={{
                  background: 'linear-gradient(45deg, #f39c12 30%, #e67e22 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e67e22 30%, #d35400 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Warning Notification
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Button
                variant="contained"
                onClick={handleInfoDemo}
                sx={{
                  background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2980b9 30%, #1f3a93 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Info Notification
              </Button>

              <Button
                variant="contained"
                onClick={handleLoadingDemo}
                sx={{
                  background: 'linear-gradient(45deg, #9b59b6 30%, #8e44ad 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #8e44ad 30%, #7d3c98 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Loading Notification
              </Button>

              <Button
                variant="contained"
                onClick={handleConfirmationDemo}
                sx={{
                  background: 'linear-gradient(45deg, #34495e 30%, #2c3e50 90%)',
                  color: 'white',
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2c3e50 30%, #1b2631 90%)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Show Confirmation Dialog
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleCloseAll}
            sx={{
              borderColor: '#e74c3c',
              color: '#e74c3c',
              py: 1.5,
              px: 4,
              fontSize: '14px',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#c0392b',
                color: '#c0392b',
                backgroundColor: '#fdf2f2',
              }
            }}
          >
            Close All Notifications
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2d3436', fontWeight: 600 }}>
            Features:
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72', mb: 1 }}>
            ✨ Top-right corner positioning for all notifications
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72', mb: 1 }}>
            🎨 Custom styling that matches your app's color scheme
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72', mb: 1 }}>
            ⏱️ 4-second auto-dismiss with progress bar
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72', mb: 1 }}>
            🖱️ Pause on hover functionality
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72', mb: 1 }}>
            📱 Responsive design with beautiful animations
          </Typography>
          <Typography variant="body1" sx={{ color: '#636e72' }}>
            🎯 Easy to use utility functions for all notification types
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationDemo;
