import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TasksIcon,
  Analytics as AnalyticsIcon,
  Groups as TeamsIcon,
  Description as DocumentsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const DashboardLayout = ({ children, currentView, onViewChange, darkMode, onToggleDarkMode, taskCount = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, userProfile, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, key: 'dashboard' },
    { text: 'Tasks', icon: <TasksIcon />, key: 'tasks' },
    { text: 'Analytics', icon: <AnalyticsIcon />, key: 'analytics' },
    { text: 'Teams', icon: <TeamsIcon />, key: 'teams' },
    { text: 'Documents', icon: <DocumentsIcon />, key: 'documents' },
    { text: 'Settings', icon: <SettingsIcon />, key: 'settings' }
  ];

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2
          }}
        >
          <DashboardIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          TaskHub
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Project Management
        </Typography>
      </Box>

      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => onViewChange(item.key)}
              selected={currentView === item.key}
              sx={{
                borderRadius: 3,
                color: 'rgba(255,255,255,0.9)',
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transform: 'translateX(8px)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.3))',
                  }
                },
                '&:hover': {
                  background: 'rgba(255,255,255,0.08)',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                py: 1.5,
                px: 2
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: currentView === item.key ? 600 : 400 
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={onToggleDarkMode}
              icon={<LightModeIcon sx={{ fontSize: 16 }} />}
              checkedIcon={<DarkModeIcon sx={{ fontSize: 16 }} />}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {darkMode ? 'Dark' : 'Light'} Mode
            </Typography>
          }
          sx={{ color: 'rgba(255,255,255,0.8)' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: '#333' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
              Hello, {userProfile?.firstName || currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You've got {taskCount} {taskCount === 1 ? 'task' : 'tasks'} today
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#333', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              Project time tracker
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2, display: { xs: 'none', sm: 'block' } }}>
              You can start tracking
            </Typography>
            
            <IconButton size="large" sx={{ color: '#333' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
                }}
              >
                {currentUser?.email?.charAt(0).toUpperCase() || 'J'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Avatar sx={{ width: 24, height: 24, mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: darkMode 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
