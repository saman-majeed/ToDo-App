import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import TaskUploader from './TaskUploader';
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
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import TodoList from './TodoList';
import Analytics from './Analytics';
import { Teams, Documents, Settings } from './OtherViews';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState(null);
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
    if (!newTask.trim()) {
      setError('Please enter a task description');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to add tasks');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Enhanced debug logs
      console.log('🚀 Starting addTask function');
      console.log('👤 Current user:', currentUser);
      console.log('🆔 User ID:', currentUser?.uid);
      console.log('📧 User email:', currentUser?.email);
      console.log('🔒 User email verified:', currentUser?.emailVerified);
      console.log('📝 Adding task:', newTask);
      console.log('📅 Selected due date:', selectedDueDate);
      console.log('📄 New description:', newDescription);
      
      // Test database connection first
      console.log('🔗 Testing database connection...');
      console.log('🏗️ Database object:', db);
      console.log('📊 Collection reference test...');
      
      const taskData = {
        text: newTask.trim(),
        completed: false,
        userId: currentUser.uid,
        createdAt: new Date()
      };
      
      // Add due date if selected (ensure it's a proper Date object)
      if (selectedDueDate) {
        try {
          const dueDate = selectedDueDate instanceof Date ? selectedDueDate : new Date(selectedDueDate);
          if (!isNaN(dueDate.getTime())) {
            taskData.dueDate = dueDate;
          }
        } catch (dateError) {
          console.warn('Invalid due date, skipping:', dateError);
        }
      }
      
      console.log('💾 Task data to save:', taskData);
      
      const docRef = await addDoc(collection(db, 'Tasks'), taskData);
      
      console.log('✅ Document written with ID:', docRef.id);
      
      // Add description to subcollection if provided
      if (newDescription.trim()) {
        try {
          await addDescriptionToTask(docRef.id, newDescription.trim());
          console.log('✅ Description added successfully');
        } catch (descError) {
          console.error('❌ Failed to add description:', descError);
          // Don't fail the whole task creation if description fails
        }
      }
      
      // Clear form and close dialog
      setNewTask('');
      setNewDescription('');
      setSelectedDueDate(null);
      setOpen(false);
      
      console.log('✅ Task added successfully');
      
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // More specific error messages
      let errorMessage = 'Failed to add task';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your account permissions.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'You must be logged in to add tasks.';
      } else if (error.message) {
        errorMessage = `Failed to add task: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  // New state for the dashboard
  const [currentView, setCurrentView] = useState('tasks');
  const [darkMode, setDarkMode] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleAddTask = (date = null) => {
    if (date) {
      try {
        // Ensure the date is a proper Date object
        const validDate = date instanceof Date ? date : new Date(date);
        if (!isNaN(validDate.getTime())) {
          setSelectedDueDate(validDate);
        } else {
          console.warn('Invalid date provided to handleAddTask:', date);
          setSelectedDueDate(null);
        }
      } catch (error) {
        console.warn('Error processing date in handleAddTask:', error);
        setSelectedDueDate(null);
      }
    } else {
      setSelectedDueDate(null);
    }
    setOpen(true);
  };

  const handleUploadTasks = async (uploadedTasks) => {
    try {
      setError('');
      
      // Process each uploaded task
      for (const task of uploadedTasks) {
        const taskData = {
          text: task.text,
          completed: task.completed || false,
          userId: currentUser.uid,
          createdAt: new Date(),
          source: 'file-upload'
        };
        
        // Add due date if present
        if (task.dueDate) {
          taskData.dueDate = task.dueDate;
        }
        
        const docRef = await addDoc(collection(db, 'Tasks'), taskData);
        
        // Add description if provided
        if (task.description && task.description.trim()) {
          await addDescriptionToTask(docRef.id, task.description);
        }
      }
      
      console.log(`Successfully uploaded ${uploadedTasks.length} tasks`);
      
    } catch (error) {
      console.error('Failed to upload tasks:', error);
      setError('Failed to upload tasks: ' + error.message);
      throw error;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            todos={todos} 
            onAddTask={handleAddTask} 
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
            darkMode={darkMode} 
          />
        );
      case 'tasks':
        return (
          <TodoList 
            todos={todos}
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
            onAddTask={handleAddTask}
            onEditTask={null}
            darkMode={darkMode}
            taskDescriptions={taskDescriptions}
            onUpdateDescription={null}
            expandedTasks={expandedTasks}
            onToggleExpanded={toggleExpanded}
            editingDescription={editingDescription}
            onStartEditingDescription={startEditingDescription}
            onCancelEditingDescription={cancelEditingDescription}
            onSaveDescription={saveDescription}
            tempDescription={tempDescription}
            onTempDescriptionChange={setTempDescription}
            onUploadTasks={() => setUploadDialogOpen(true)}
          />
        );
      case 'analytics':
        return <Analytics todos={todos} darkMode={darkMode} />;
      case 'teams':
        return <Teams darkMode={darkMode} />;
      case 'documents':
        return <Documents todos={todos} taskDescriptions={taskDescriptions} darkMode={darkMode} />;
      case 'settings':
        return <Settings darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />;
      default:
        return <Dashboard todos={todos} onAddTask={handleAddTask} darkMode={darkMode} />;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', top: 80, left: 300, right: 20, zIndex: 1300 }}>
          {error}
        </Alert>
      )}
      
      <DashboardLayout 
        currentView={currentView} 
        onViewChange={handleViewChange}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        taskCount={totalCount}
      >
        {renderCurrentView()}
      </DashboardLayout>

      {/* Add Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Add New Task
          {selectedDueDate && (
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Scheduled for: {(selectedDueDate instanceof Date ? selectedDueDate : new Date(selectedDueDate)).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          )}
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

      {/* Task Uploader Dialog */}
      <TaskUploader 
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onTasksUpload={handleUploadTasks}
        darkMode={darkMode}
      />
    </Box>
  );
}
