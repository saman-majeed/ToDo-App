import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Box,
  AppBar,
  Toolbar,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Collapse,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [editingDescription, setEditingDescription] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [taskDescriptions, setTaskDescriptions] = useState({});
  const [loadingDescriptions, setLoadingDescriptions] = useState(new Set());
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No current user');
      return;
    }

    console.log('🔍 Current user:', currentUser);
    console.log('🆔 User ID:', currentUser.uid);
    console.log('📧 User email:', currentUser.email);

    const q = query(
      collection(db, 'Tasks'),
      where('userId', '==', currentUser.uid)
      // Temporarily removing orderBy to test
      // orderBy('createdAt', 'desc')
    );

    console.log('🔥 Setting up Firestore listener...');

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('📊 Query snapshot received!');
      console.log('📝 Number of documents:', querySnapshot.size);
      
      const todosArray = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Document:', doc.id, data);
        console.log('👤 Document userId:', data.userId);
        console.log('🔄 Current user ID:', currentUser.uid);
        console.log('✅ IDs match?', data.userId === currentUser.uid);
        todosArray.push({ id: doc.id, ...data });
      });
      
      console.log('📋 Final todos array:', todosArray);
      console.log('📊 Array length:', todosArray.length);
      
      setTodos(todosArray);
      setError(''); // Clear any previous errors
      
      // Load descriptions for all tasks
      todosArray.forEach(todo => {
        loadTaskDescription(todo.id);
      });
      
    }, (error) => {
      console.error('❌ Firestore error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError('Error fetching todos: ' + error.message);
    });

    return () => {
      console.log('🧹 Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [currentUser]);

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      // Debug logs
      console.log('Current user:', currentUser);
      console.log('User ID:', currentUser?.uid);
      console.log('Adding task:', newTask);
      
      const docRef = await addDoc(collection(db, 'Tasks'), {
        text: newTask,
        completed: false,
        userId: currentUser.uid,
        createdAt: new Date()
      });
      
      console.log('Document written with ID: ', docRef.id);
      
      // Add description to subcollection if provided
      if (newDescription.trim()) {
        await addDescriptionToTask(docRef.id, newDescription);
      }
      
      setNewTask('');
      setNewDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError('Failed to add task: ' + error.message);
    }
    setLoading(false);
  };

  const toggleComplete = async (id, completed) => {
    try {
      const todoRef = doc(db, 'Tasks', id);
      await updateDoc(todoRef, {
        completed: !completed
      });
    } catch (error) {
      setError('Failed to update task: ' + error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'Tasks', id));
    } catch (error) {
      setError('Failed to delete task: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to logout: ' + error.message);
    }
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const startEditingDescription = (taskId, currentDescription) => {
    setEditingDescription(taskId);
    setTempDescription(taskDescriptions[taskId] || '');
  };

  const cancelEditingDescription = () => {
    setEditingDescription(null);
    setTempDescription('');
  };

  const loadTaskDescription = async (taskId) => {
    try {
      setLoadingDescriptions(prev => new Set([...prev, taskId]));
      
      const descriptionsRef = collection(db, 'Tasks', taskId, 'descriptions');
      const descriptionsSnapshot = await getDocs(descriptionsRef);
      
      let latestDescription = '';
      let latestTimestamp = null;
      
      descriptionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!latestTimestamp || data.createdAt > latestTimestamp) {
          latestDescription = data.text;
          latestTimestamp = data.createdAt;
        }
      });
      
      setTaskDescriptions(prev => ({
        ...prev,
        [taskId]: latestDescription
      }));
      
    } catch (error) {
      console.error('Failed to load description:', error);
    } finally {
      setLoadingDescriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const addDescriptionToTask = async (taskId, descriptionText) => {
    try {
      const descriptionsRef = collection(db, 'Tasks', taskId, 'descriptions');
      const descriptionDoc = {
        text: descriptionText,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };
      
      await addDoc(descriptionsRef, descriptionDoc);
      
      // Update local state
      setTaskDescriptions(prev => ({
        ...prev,
        [taskId]: descriptionText
      }));
      
    } catch (error) {
      console.error('Failed to add description:', error);
      throw error;
    }
  };

  const saveDescription = async (taskId) => {
    try {
      const descriptionsRef = collection(db, 'Tasks', taskId, 'descriptions');
      
      // Get current version count
      const existingDescriptions = await getDocs(descriptionsRef);
      const version = existingDescriptions.size + 1;
      
      const descriptionDoc = {
        text: tempDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: version
      };
      
      await addDoc(descriptionsRef, descriptionDoc);
      
      // Update local state
      setTaskDescriptions(prev => ({
        ...prev,
        [taskId]: tempDescription
      }));
      
      setEditingDescription(null);
      setTempDescription('');
    } catch (error) {
      setError('Failed to update description: ' + error.message);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            My Todo App
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {currentUser?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, pb: 10 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Your Tasks
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip 
                label={`Total: ${totalCount}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Completed: ${completedCount}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`Remaining: ${totalCount - completedCount}`} 
                color="warning" 
                variant="outlined" 
              />
            </Box>
          </Box>

          {todos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No tasks yet! Add your first task to get started.
              </Typography>
            </Box>
          ) : (
            <List>
              {todos.map((todo) => (
                <Paper
                  key={todo.id}
                  elevation={expandedTasks.has(todo.id) ? 4 : 2}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: todo.completed ? '#f1f8e9' : '#fff',
                    border: expandedTasks.has(todo.id) 
                      ? '2px solid #4ECDC4' 
                      : '1px solid #e0e0e0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    transform: expandedTasks.has(todo.id) ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.01)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <ListItem
                    onClick={() => toggleExpanded(todo.id)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: todo.completed ? '#e8f5e8' : 'rgba(76, 205, 196, 0.08)',
                      },
                      position: 'relative'
                    }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleComplete(todo.id, todo.completed);
                      }}
                      color="success"
                      sx={{
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.08)'
                        }
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography
                            sx={{
                              textDecoration: todo.completed ? 'line-through' : 'none',
                              opacity: todo.completed ? 0.7 : 1,
                              fontWeight: 500,
                              fontSize: '1.1rem'
                            }}
                          >
                            {todo.text}
                          </Typography>
                          {taskDescriptions[todo.id] && (
                            <Chip
                              icon={<DescriptionIcon />}
                              label="Click to view details"
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 22,
                                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                animation: expandedTasks.has(todo.id) ? 'none' : 'pulse 2s infinite'
                              }}
                            />
                          )}
                          {!taskDescriptions[todo.id] && !loadingDescriptions.has(todo.id) && (
                            <Chip
                              label="No description"
                              size="small"
                              variant="outlined"
                              color="default"
                              sx={{ 
                                fontSize: '0.65rem', 
                                height: 20,
                                opacity: 0.6
                              }}
                            />
                          )}
                          {loadingDescriptions.has(todo.id) && (
                            <Chip
                              label="Loading..."
                              size="small"
                              variant="outlined"
                              color="default"
                              sx={{ 
                                fontSize: '0.65rem', 
                                height: 20,
                                opacity: 0.6
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        expandedTasks.has(todo.id) && taskDescriptions[todo.id] ? (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 1, 
                              fontStyle: 'italic',
                              color: 'text.secondary'
                            }}
                          >
                            Click again to hide details
                          </Typography>
                        ) : null
                      }
                      sx={{ ml: 1 }}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(todo.id);
                          }}
                          size="small"
                          sx={{
                            bgcolor: expandedTasks.has(todo.id) ? 'rgba(76, 205, 196, 0.1)' : 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(76, 205, 196, 0.2)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {expandedTasks.has(todo.id) ? 
                            <ExpandLessIcon sx={{ color: '#4ECDC4' }} /> : 
                            <ExpandMoreIcon sx={{ color: '#666' }} />
                          }
                        </IconButton>
                        {todo.completed && (
                          <Chip 
                            icon={<CheckIcon />} 
                            label="Done!" 
                            color="success" 
                            size="small" 
                            sx={{ 
                              mr: 1,
                              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                              color: 'white',
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        )}
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(todo.id);
                          }}
                          color="error"
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Collapse in={expandedTasks.has(todo.id)} timeout={300}>
                    <Divider sx={{ borderColor: '#4ECDC4', borderWidth: 1 }} />
                    <Box 
                      sx={{ 
                        p: 3, 
                        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        background: taskDescriptions[todo.id] 
                          ? 'linear-gradient(135deg, rgba(76, 205, 196, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%)'
                          : 'rgba(245, 245, 245, 0.8)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, #4ECDC4, #FF6B6B, #45B7D1)',
                          borderRadius: '0 0 10px 10px'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <DescriptionIcon sx={{ color: '#4ECDC4', fontSize: 20 }} />
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: '#4ECDC4', 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1
                          }}
                        >
                          Task Details
                        </Typography>
                        <Box sx={{ marginLeft: 'auto' }}>
                          {editingDescription === todo.id ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => saveDescription(todo.id)}
                                sx={{
                                  color: '#4CAF50',
                                  '&:hover': {
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={cancelEditingDescription}
                                sx={{
                                  color: '#f44336',
                                  '&:hover': {
                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => startEditingDescription(todo.id, taskDescriptions[todo.id])}
                              sx={{
                                color: '#4ECDC4',
                                '&:hover': {
                                  bgcolor: 'rgba(76, 205, 196, 0.1)',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                          borderRadius: 2,
                          border: editingDescription === todo.id 
                            ? '2px solid #4ECDC4' 
                            : '1px dashed rgba(76, 205, 196, 0.3)',
                          transition: 'border 0.3s ease'
                        }}
                      >
                        {editingDescription === todo.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={tempDescription}
                            onChange={(e) => setTempDescription(e.target.value)}
                            placeholder="Add a detailed description for this task..."
                            variant="outlined"
                            autoFocus
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover fieldset': {
                                  borderColor: '#4ECDC4',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4ECDC4',
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveDescription(todo.id);
                              } else if (e.key === 'Escape') {
                                cancelEditingDescription();
                              }
                            }}
                          />
                        ) : taskDescriptions[todo.id] ? (
                          <Typography 
                            variant="body1" 
                            sx={{
                              whiteSpace: 'pre-wrap',
                              opacity: todo.completed ? 0.7 : 1,
                              lineHeight: 1.6,
                              color: '#444',
                              minHeight: '24px'
                            }}
                          >
                            {taskDescriptions[todo.id]}
                          </Typography>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                opacity: 0.7,
                                mb: 2
                              }}
                            >
                              No description added for this task yet.
                            </Typography>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={() => startEditingDescription(todo.id, '')}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: '#4ECDC4',
                                color: '#4ECDC4',
                                '&:hover': {
                                  borderColor: '#4ECDC4',
                                  backgroundColor: 'rgba(76, 205, 196, 0.08)'
                                }
                              }}
                            >
                              Add Description
                            </Button>
                          </Box>
                        )}
                        
                        {editingDescription === todo.id && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Press Ctrl+Enter to save, Esc to cancel
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tempDescription.length} characters
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Collapse>
                </Paper>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
          }
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Add New Task
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="What needs to be done?"
            fullWidth
            variant="outlined"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Add more details about this task..."
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpen(false)} 
            startIcon={<CloseIcon />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={addTask} 
            variant="contained"
            disabled={loading || !newTask.trim()}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
              }
            }}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
