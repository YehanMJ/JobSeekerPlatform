import React from 'react';
import { Box } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <style jsx>{`
        @keyframes bubble1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bubble2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bubble3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .bubble {
          width: 20px;
          height: 20px;
          background: #4fc3f7;
          border-radius: 50%;
          margin: 0 5px;
          display: inline-block;
        }
        .bubble:nth-child(1) {
          animation: bubble1 1.4s infinite ease-in-out;
          animation-delay: -0.32s;
        }
        .bubble:nth-child(2) {
          animation: bubble2 1.4s infinite ease-in-out;
          animation-delay: -0.16s;
        }
        .bubble:nth-child(3) {
          animation: bubble3 1.4s infinite ease-in-out;
        }
      `}</style>
      <div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
    </Box>
  );
};

export default LoadingScreen;
