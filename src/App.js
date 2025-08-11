import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import TodoApp from './components/TodoApp';
import PrivateRoute from './components/PrivateRoute';

const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#4ECDC4',
      light: '#7DDFD8',
      dark: '#26A69A',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8A80',
      dark: '#F44336',
    },
    background: {
      default: darkMode ? '#121212' : '#f5f7fa',
      paper: darkMode ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: darkMode ? '#ffffff' : '#333333',
      secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: darkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: darkMode 
              ? '0 8px 30px rgba(0, 0, 0, 0.4)'
              : '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(76, 205, 196, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(76, 205, 196, 0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createAppTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <TodoApp />
                </PrivateRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
