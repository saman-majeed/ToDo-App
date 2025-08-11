import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

const Analytics = ({ todos = [], darkMode }) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const completedCount = todos.filter(todo => todo?.completed).length;
    const totalCount = todos.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Get today's tasks
    const today = new Date().toDateString();
    const todayTasks = todos.filter(todo => {
      if (!todo?.createdAt) return false;
      try {
        let taskDate;
        if (todo.createdAt.seconds) {
          taskDate = new Date(todo.createdAt.seconds * 1000);
        } else if (todo.createdAt.toDate) {
          taskDate = todo.createdAt.toDate();
        } else {
          taskDate = new Date(todo.createdAt);
        }
        return taskDate.toDateString() === today;
      } catch {
        return false;
      }
    });
    
    const todayCompleted = todayTasks.filter(todo => todo?.completed).length;
    
    // Get this week's tasks
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekTasks = todos.filter(todo => {
      if (!todo?.createdAt) return false;
      try {
        let taskDate;
        if (todo.createdAt.seconds) {
          taskDate = new Date(todo.createdAt.seconds * 1000);
        } else if (todo.createdAt.toDate) {
          taskDate = todo.createdAt.toDate();
        } else {
          taskDate = new Date(todo.createdAt);
        }
        return taskDate >= weekStart;
      } catch {
        return false;
      }
    });
    
    const weeklyCompleted = thisWeekTasks.filter(todo => todo?.completed).length;
    
    return {
      totalCount,
      completedCount,
      completionRate,
      todayTasks: todayTasks.length,
      todayCompleted,
      thisWeekTasks: thisWeekTasks.length,
      weeklyCompleted
    };
  }, [todos]);
  
  const { 
    totalCount, 
    completedCount, 
    completionRate, 
    todayTasks, 
    todayCompleted, 
    thisWeekTasks, 
    weeklyCompleted
  } = analytics;

  const stats = [
    {
      title: "Total Tasks",
      value: totalCount,
      icon: <AssignmentIcon />,
      color: "#4ECDC4",
      change: thisWeekTasks > 0 ? `+${thisWeekTasks} this week` : "No new tasks this week"
    },
    {
      title: "Completed",
      value: completedCount,
      icon: <CheckCircleIcon />,
      color: "#96CEB4",
      change: weeklyCompleted > 0 ? `+${weeklyCompleted} this week` : "No tasks completed this week"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: <TrendingUpIcon />,
      color: completionRate >= 70 ? "#4CAF50" : completionRate >= 50 ? "#FFB800" : "#FF6B6B",
      change: completionRate >= 70 ? "Excellent progress!" : completionRate >= 50 ? "Good progress" : "Needs improvement"
    },
    {
      title: "Today's Tasks",
      value: todayTasks,
      icon: <TodayIcon />,
      color: "#FF6B6B",
      change: todayCompleted > 0 ? `${todayCompleted} completed today` : "No tasks completed today"
    }
  ];

  // Generate task-based analytics
  const projectAnalytics = useMemo(() => {
    if (todos.length === 0) {
      return [
        {
          name: "Personal Tasks",
          tasksCompleted: 0,
          totalTasks: 0,
          efficiency: 0,
          timeSpent: "0h",
          description: "No tasks yet"
        },
        {
          name: "Work Tasks",
          tasksCompleted: 0,
          totalTasks: 0,
          efficiency: 0,
          timeSpent: "0h",
          description: "No tasks yet"
        }
      ];
    }

    // Categorize tasks by patterns or keywords
    const personalKeywords = ['personal', 'home', 'buy', 'call', 'meet', 'visit', 'family', 'friend', 'health', 'exercise'];
    const workKeywords = ['work', 'project', 'meeting', 'review', 'develop', 'design', 'code', 'presentation', 'report', 'client'];
    
    const personalTasks = todos.filter(todo => {
      const text = todo?.text?.toLowerCase() || '';
      return personalKeywords.some(keyword => text.includes(keyword)) ||
             (!personalKeywords.some(keyword => text.includes(keyword)) && 
              !workKeywords.some(keyword => text.includes(keyword)));
    });
    
    const workTasks = todos.filter(todo => {
      const text = todo?.text?.toLowerCase() || '';
      return workKeywords.some(keyword => text.includes(keyword));
    });
    
    const calculateMetrics = (tasks, name) => {
      const completed = tasks.filter(task => task?.completed).length;
      const total = tasks.length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
      const avgTime = total > 0 ? Math.round((total * 1.2 + Math.random() * 2) * 10) / 10 : 0;
      
      return {
        name,
        tasksCompleted: completed,
        totalTasks: total,
        efficiency,
        timeSpent: `${avgTime}h`,
        description: total > 0 ? `${total} tasks created` : 'No tasks yet',
        status: efficiency >= 70 ? 'excellent' : efficiency >= 50 ? 'good' : 'needs-improvement'
      };
    };
    
    return [
      calculateMetrics(personalTasks, "Personal Tasks"),
      calculateMetrics(workTasks, "Work Tasks")
    ];
  }, [todos]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: darkMode ? 'white' : '#333' }}>
        Analytics Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2, width: 40, height: 40 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: stat.color }}>
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Weekly Progress Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                Weekly Activity
              </Typography>
              {thisWeekTasks > 0 ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 600, color: '#4ECDC4' }}>
                        {thisWeekTasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasks this week
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#96CEB4' }}>
                        {weeklyCompleted}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={thisWeekTasks > 0 ? (weeklyCompleted / thisWeekTasks) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(45deg, #4ECDC4, #96CEB4)'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {thisWeekTasks > 0 ? Math.round((weeklyCompleted / thisWeekTasks) * 100) : 0}% completion rate this week
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    No tasks created this week
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Start adding tasks to see weekly progress
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                Task Distribution
              </Typography>
              {totalCount > 0 ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Pending Tasks</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFB800' }}>
                        {totalCount - completedCount}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                        {totalCount}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">Completed</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                        {completedCount}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Box 
                      sx={{ 
                        flex: completedCount / totalCount,
                        height: 8, 
                        background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                        borderRadius: '4px 0 0 4px'
                      }} 
                    />
                    <Box 
                      sx={{ 
                        flex: (totalCount - completedCount) / totalCount,
                        height: 8, 
                        background: 'linear-gradient(45deg, #FFB800, #FF8A00)',
                        borderRadius: '0 4px 4px 0'
                      }} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                      {completionRate}% Complete
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FFB800' }}>
                      {100 - completionRate}% Pending
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    No tasks yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Create your first task to see distribution
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                Project Performance
              </Typography>
              {projectAnalytics.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No Task Categories Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start adding tasks to see performance analytics
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {projectAnalytics.map((project, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                                {project.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {project.totalTasks > 0 
                                  ? `${project.tasksCompleted}/${project.totalTasks} tasks completed` 
                                  : project.description
                                }
                              </Typography>
                            </Box>
                            {project.totalTasks > 0 && (
                              <Chip 
                                label={`${project.efficiency}%`}
                                color={project.efficiency >= 70 ? "success" : project.efficiency >= 50 ? "warning" : "error"}
                                size="small"
                              />
                            )}
                          </Box>
                          
                          {project.totalTasks > 0 ? (
                            <>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Progress
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {project.efficiency}%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={project.efficiency} 
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      background: project.efficiency >= 70 
                                        ? 'linear-gradient(45deg, #4CAF50, #45A049)'
                                        : project.efficiency >= 50
                                          ? 'linear-gradient(45deg, #FFB800, #FF8A00)' 
                                          : 'linear-gradient(45deg, #FF6B6B, #FF5252)'
                                    }
                                  }}
                                />
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Estimated time: {project.timeSpent}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ 
                                    bgcolor: project.efficiency >= 70 ? '#4CAF50' : project.efficiency >= 50 ? '#FFB800' : '#FF6B6B',
                                    width: 24, 
                                    height: 24, 
                                    fontSize: '0.7rem'
                                  }}>
                                    {project.name.charAt(0)}
                                  </Avatar>
                                </Box>
                              </Box>
                            </>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                No tasks in this category yet
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
