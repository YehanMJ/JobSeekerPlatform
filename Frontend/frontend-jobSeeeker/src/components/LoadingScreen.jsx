import React from 'react';
import { Box, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const containerStyle = {
    position: fullScreen ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  return (
    <Box sx={containerStyle}>
      <style>{`
        .bubble-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }
        .bubble-spinner {
          display: flex;
          gap: 0.5rem;
        }
        .bubble {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2196f3;
          opacity: 0.8;
          animation: bubble-bounce 1s infinite alternate;
        }
        .bubble:nth-child(2) {
          animation-delay: 0.2s;
        }
        .bubble:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bubble-bounce {
          0% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-18px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
        }
      `}</style>
      <div className="bubble-loader">
        <div className="bubble-spinner">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
      </div>
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#333',
          fontFamily: 'Inconsolata, monospace',
          fontWeight: 500,
          textAlign: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.6 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.6 },
          }
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
