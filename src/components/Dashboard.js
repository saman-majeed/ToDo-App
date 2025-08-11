import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Button,
  Chip,
  Calendar,
  Badge,
  IconButton,
  Paper,
  Stack,
  Divider,
  ButtonBase
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const Dashboard = ({ todos = [], onAddTask, onToggleComplete, onDeleteTask, darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeTracking, setTimeTracking] = useState(false);
  const [trackedTime, setTrackedTime] = useState(0);

  // Generate project data from actual tasks
  const generateProjectsFromTasks = (tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];
    
    // Categorize tasks into projects
    const projectCategories = {};
    
    tasks.forEach(task => {
      if (!task || !task.text) return;
      
      const text = task.text.toLowerCase();
      let category = 'General Tasks';
      let description = 'General task management';
      
      // Categorize based on task content
      if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('mockup') || text.includes('wireframe')) {
        category = 'Design Project';
        description = 'UI/UX design and creative work';
      } else if (text.includes('code') || text.includes('develop') || text.includes('programming') || text.includes('bug') || text.includes('feature') || text.includes('api')) {
        category = 'Development Project';
        description = 'Software development and coding tasks';
      } else if (text.includes('meeting') || text.includes('call') || text.includes('discuss') || text.includes('presentation')) {
        category = 'Communication & Meetings';
        description = 'Team communication and meetings';
      } else if (text.includes('test') || text.includes('qa') || text.includes('review') || text.includes('check')) {
        category = 'Quality Assurance';
        description = 'Testing and quality control';
      } else if (text.includes('plan') || text.includes('strategy') || text.includes('manage') || text.includes('organize')) {
        category = 'Project Management';
        description = 'Planning and project coordination';
      } else if (text.includes('research') || text.includes('analysis') || text.includes('study') || text.includes('investigate')) {
        category = 'Research & Analysis';
        description = 'Research and data analysis tasks';
      }
      
      if (!projectCategories[category]) {
        projectCategories[category] = {
          tasks: [],
          description: description
        };
      }
      
      projectCategories[category].tasks.push(task);
    });
    
    // Convert to project format
    const projects = Object.entries(projectCategories).map(([name, data], index) => {
      const totalTasks = data.tasks.length;
      const completedTasks = data.tasks.filter(task => task.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Generate team members based on project type
      const teamMembers = generateTeamMembers(name, index);
      
      // Project colors and styles
      const projectStyles = [
        { color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", isDark: false },
        { color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", isDark: true },
        { color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", isDark: false },
        { color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", isDark: false },
        { color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", isDark: false },
        { color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", isDark: false }
      ];
      
      const style = projectStyles[index % projectStyles.length];
      
      return {
        id: index + 1,
        name: name,
        description: data.description,
        progress: progress,
        teamMembers: teamMembers,
        color: style.color,
        isDark: style.isDark,
        tasks: totalTasks,
        completedTasks: completedTasks
      };
    });
    
    // Limit to 4 projects max for better display
    return projects.slice(0, 4);
  };
  
  // Generate team members for each project
  const generateTeamMembers = (projectName, index) => {
    const memberPools = {
      'Design Project': [
        { name: "Alex", avatar: "A", color: "#FF6B6B" },
        { name: "Sarah", avatar: "S", color: "#4ECDC4" },
        { name: "Maya", avatar: "M", color: "#45B7D1" },
        { name: "Lucas", avatar: "L", color: "#96CEB4" }
      ],
      'Development Project': [
        { name: "David", avatar: "D", color: "#FF6B6B" },
        { name: "Emma", avatar: "E", color: "#4ECDC4" },
        { name: "Ryan", avatar: "R", color: "#45B7D1" },
        { name: "Olivia", avatar: "O", color: "#96CEB4" },
        { name: "James", avatar: "J", color: "#FECA57" }
      ],
      'default': [
        { name: "You", avatar: "Y", color: "#4ECDC4" },
        { name: "Team", avatar: "T", color: "#FF6B6B" },
        { name: "Member", avatar: "M", color: "#45B7D1" }
      ]
    };
    
    const members = memberPools[projectName] || memberPools['default'];
    // Return 2-4 members randomly
    const memberCount = Math.min(members.length, Math.max(2, Math.floor(Math.random() * 4) + 1));
    return members.slice(0, memberCount);
  };
  
  const projects = generateProjectsFromTasks(todos);

  // Helper function to check if a date is the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    try {
      const d1 = date1 instanceof Date ? date1 : date1.toDate ? date1.toDate() : new Date(date1);
      const d2 = date2 instanceof Date ? date2 : date2.toDate ? date2.toDate() : new Date(date2);
      return d1.toDateString() === d2.toDateString();
    } catch (error) {
      console.warn('Date comparison error:', error);
      return false;
    }
  };

  // Get today's date as a stable string for comparison
  const todayString = new Date().toDateString();
  
  // Get tasks for today with safety checks
  const todayTasks = useMemo(() => {
    if (!Array.isArray(todos) || todos.length === 0) return [];
    
    return todos.filter(todo => {
      if (!todo) return false;
      
      try {
        if (todo.dueDate) {
          return isSameDay(todo.dueDate, new Date(todayString));
        }
        // Also include tasks created today if no due date
        if (todo.createdAt) {
          return isSameDay(todo.createdAt, new Date(todayString));
        }
        return false;
      } catch (error) {
        console.warn('Error filtering today tasks:', error);
        return false;
      }
    });
  }, [todos, todayString]);

  const completedCount = todos.filter(todo => todo?.completed).length;
  const totalCount = todos.length;

  useEffect(() => {
    let interval;
    if (timeTracking) {
      interval = setInterval(() => {
        setTrackedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeTracking]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimeTracking = () => {
    setTimeTracking(!timeTracking);
  };

  // Get tasks for a specific date with safety checks
  const getTasksForDate = (date) => {
    if (!Array.isArray(todos) || todos.length === 0) return [];
    
    return todos.filter(todo => {
      if (!todo) return false;
      
      try {
        if (todo.dueDate) {
          return isSameDay(todo.dueDate, date);
        }
        // If no due date, only show for today
        if (todo.createdAt) {
          return isSameDay(todo.createdAt, date);
        }
        return false;
      } catch (error) {
        console.warn('Error filtering tasks for date:', error);
        return false;
      }
    });
  };

  // Handle date click - opens add task dialog with selected date
  const handleDateClick = (date) => {
    setSelectedDate(date);
    onAddTask(date); // Pass the selected date to the add task function
  };

  // Calendar component
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = today.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    // Generate calendar days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        if (week === 0 || currentDate <= lastDay) {
          days.push(currentDate);
        }
      }
    }

    return (
      <Card sx={{ height: '100%', overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
              {monthName}
            </Typography>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => onAddTask()}>
              Add task
            </Button>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
            {dayNames.map(day => (
              <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                {day}
              </Typography>
            ))}
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 3 }}>
            {days.slice(0, 35).map((date, index) => {
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = date.getMonth() === currentMonth;
              const dayTasks = getTasksForDate(date);
              const hasActiveTasks = dayTasks.some(task => !task.completed);
              const hasCompletedTasks = dayTasks.some(task => task.completed);
              
              return (
                <ButtonBase
                  key={index}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    aspectRatio: 1,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    backgroundColor: isToday ? '#FFB800' : isSelected ? 'rgba(76, 205, 196, 0.2)' : 'transparent',
                    border: isSelected ? '2px solid #4ECDC4' : 'none',
                    color: isToday ? 'white' : (isCurrentMonth ? (darkMode ? 'white' : '#333') : 'text.disabled'),
                    fontWeight: isToday || isSelected ? 600 : 400,
                    '&:hover': {
                      backgroundColor: isToday ? '#FFB800' : 'rgba(76, 205, 196, 0.1)'
                    },
                    cursor: 'pointer'
                  }}
                >
                  <Typography variant="body2">
                    {date.getDate()}
                  </Typography>
                  
                  {/* Task indicators */}
                  <Box sx={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
                    {hasActiveTasks && (
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: '#FF6B6B'
                        }}
                      />
                    )}
                    {hasCompletedTasks && (
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: '#4ECDC4'
                        }}
                      />
                    )}
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
          
          {/* Selected Date Tasks */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: darkMode ? 'white' : '#333' }}>
              Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
            
            {getTasksForDate(selectedDate).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No tasks scheduled for this day
              </Typography>
            ) : (
              <Stack spacing={1}>
                {getTasksForDate(selectedDate).map((task) => (
                  <Paper
                    key={task.id}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: task.completed ? 'rgba(76, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: task.completed ? '1px solid rgba(76, 205, 196, 0.3)' : '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => onToggleComplete(task.id, task.completed)}
                      sx={{ mr: 1 }}
                    >
                      {task.completed ? <CheckCircleIcon sx={{ color: '#4ECDC4' }} /> : 
                       <Box sx={{ width: 20, height: 20, border: '2px solid #ccc', borderRadius: '50%' }} />}
                    </IconButton>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        flex: 1,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1,
                        color: darkMode ? 'white' : '#333'
                      }}
                    >
                      {task.text}
                    </Typography>
                    
                    {task.completed && (
                      <Chip 
                        label="Done" 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1, fontSize: '0.7rem' }}
                      />
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Section */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* My Tasks Summary */}
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    My tasks
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Recently</Typography>
                      <Typography variant="h6">{Math.max(0, totalCount - 3)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Today</Typography>
                      <Typography variant="h6">{totalCount}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Upcoming</Typography>
                      <Typography variant="h6">{Math.floor(Math.random() * 5) + 2}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Later</Typography>
                      <Typography variant="h6">{Math.floor(Math.random() * 8) + 3}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    April 10, 2020 - Today
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { background: 'rgba(255,255,255,0.3)' }
                    }}
                    onClick={onAddTask}
                  >
                    + Add task
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Project Cards */}
            {projects.map((project) => (
              <Grid item xs={12} md={6} key={project.id}>
                <Card 
                  sx={{ 
                    background: project.isDark ? '#2C2C2E' : 'white',
                    color: project.isDark ? 'white' : '#333',
                    minHeight: 280,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': project.isDark ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: project.color,
                      opacity: 0.1,
                    } : {}
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {project.description}
                        </Typography>
                      </Box>
                      <IconButton size="small" sx={{ color: 'inherit' }}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {project.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={project.progress} 
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: 'linear-gradient(45deg, #4ECDC4, #44A08D)'
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem' } }}>
                          {project.teamMembers.map((member, index) => (
                            <Avatar key={index} sx={{ bgcolor: member.color, width: 32, height: 32 }}>
                              {member.avatar}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                        <Chip 
                          label={`${project.completedTasks}/${project.tasks} tasks`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: project.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                            color: 'inherit'
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Today's Tasks - Top Row */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                    Today's Tasks
                  </Typography>
                  <Stack spacing={2}>
                    {todayTasks.length === 0 ? (
                      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                        <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          No tasks for today
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click "Add task" to get started!
                        </Typography>
                      </Paper>
                    ) : (
                      todayTasks.map((task, index) => (
                        <Paper
                          key={task.id}
                          sx={{
                            p: 2,
                            background: task.completed 
                              ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)' 
                              : index === 0 
                                ? 'linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)' 
                                : 'rgba(0,0,0,0.02)',
                            color: task.completed || index === 0 ? 'white' : (darkMode ? 'white' : '#333'),
                            borderRadius: 2,
                            position: 'relative'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.8 : 1
                            }}>
                              {task.text}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {(() => {
                                if (!task.createdAt) return 'Today';
                                try {
                                  let date;
                                  if (task.createdAt.seconds) {
                                    // Firestore Timestamp
                                    date = new Date(task.createdAt.seconds * 1000);
                                  } else if (task.createdAt.toDate) {
                                    // Firestore Timestamp object
                                    date = task.createdAt.toDate();
                                  } else {
                                    // Regular Date object or timestamp
                                    date = new Date(task.createdAt);
                                  }
                                  return date.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  });
                                } catch (error) {
                                  console.warn('Date formatting error:', error);
                                  return 'Today';
                                }
                              })()} 
                            </Typography>
                          </Box>
                          
                          {task.completed && (
                            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                              <CheckCircleIcon fontSize="small" sx={{ color: 'white' }} />
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip 
                              label={task.completed ? 'Completed' : 'In Progress'} 
                              size="small" 
                              sx={{ 
                                backgroundColor: task.completed ? 'rgba(255,255,255,0.2)' : 'rgba(76, 205, 196, 0.1)',
                                color: task.completed ? 'white' : '#4ECDC4',
                                fontSize: '0.7rem'
                              }}
                            />
                            
                            <IconButton 
                              size="small" 
                              onClick={() => onToggleComplete(task.id, task.completed)}
                              sx={{ color: task.completed || index === 0 ? 'white' : 'text.secondary' }}
                            >
                              {task.completed ? <CheckCircleIcon fontSize="small" /> : 
                               <Box sx={{ width: 16, height: 16, border: '2px solid currentColor', borderRadius: '50%' }} />}
                            </IconButton>
                          </Box>
                        </Paper>
                      ))
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Calendar - Bottom Row */}
            <Grid item xs={12} md={6}>
              {renderCalendar()}
            </Grid>
          </Grid>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Time Tracker */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                    Project time tracker
                  </Typography>
                  <Button 
                    variant="contained"
                    size="small"
                    startIcon={timeTracking ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={toggleTimeTracking}
                    sx={{
                      background: timeTracking ? 'linear-gradient(45deg, #FF6B6B, #FF8A00)' : 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      minWidth: 80
                    }}
                  >
                    {timeTracking ? 'Pause' : 'Start'}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  You can start tracking
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                    {formatTime(trackedTime)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Time tracked today
                  </Typography>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
