import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Button,
  Chip,
  Divider,
  TextField,
  Collapse,
  Paper,
  Grid,
  Fab
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

const TodoList = ({ 
  todos, 
  onToggleComplete, 
  onDeleteTask, 
  onAddTask,
  onEditTask,
  darkMode,
  taskDescriptions,
  onUpdateDescription,
  expandedTasks,
  onToggleExpanded,
  editingDescription,
  onStartEditingDescription,
  onCancelEditingDescription,
  onSaveDescription,
  tempDescription,
  onTempDescriptionChange,
  onUploadTasks
}) => {
  const [filter, setFilter] = useState('all'); // all, active, completed

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  const formatDate = (date) => {
    if (!date) return 'No date';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TaskItem = ({ todo }) => {
    const isExpanded = expandedTasks.has(todo.id);
    const isEditing = editingDescription === todo.id;
    const description = taskDescriptions[todo.id] || '';

    return (
      <Card 
        sx={{ 
          mb: 2,
          background: todo.completed 
            ? (darkMode ? 'rgba(76, 205, 196, 0.1)' : 'rgba(76, 205, 196, 0.05)')
            : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white'),
          border: todo.completed ? '1px solid rgba(76, 205, 196, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: description || isEditing ? 1 : 0 }}>
            <Checkbox
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<CheckCircleIcon />}
              checked={todo.completed}
              onChange={() => onToggleComplete(todo.id, todo.completed)}
              sx={{
                color: todo.completed ? '#4ECDC4' : 'text.secondary',
                '&.Mui-checked': { color: '#4ECDC4' }
              }}
            />
            
            <Box sx={{ flexGrow: 1, ml: 1 }}>
              <Typography 
                variant="body1" 
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  opacity: todo.completed ? 0.7 : 1,
                  fontWeight: 500,
                  color: darkMode ? 'white' : '#333'
                }}
              >
                {todo.text}
              </Typography>
              
              {todo.createdAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {formatDate(todo.createdAt)}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {todo.completed && (
                <Chip 
                  label="Completed" 
                  size="small" 
                  color="success" 
                  sx={{ mr: 1, fontSize: '0.75rem' }}
                />
              )}
              
              {(description || isEditing) && (
                <IconButton 
                  size="small" 
                  onClick={() => onToggleExpanded(todo.id)}
                  sx={{ mr: 1 }}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              
              <IconButton 
                size="small" 
                onClick={() => onStartEditingDescription(todo.id, description)}
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => onDeleteTask(todo.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Description Section */}
          <Collapse in={isExpanded || isEditing}>
            <Divider sx={{ mb: 2 }} />
            
            {isEditing ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add a description for this task..."
                  value={tempDescription}
                  onChange={(e) => onTempDescriptionChange(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={() => onSaveDescription(todo.id)}
                    sx={{ 
                      background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      '&:hover': { background: 'linear-gradient(45deg, #26A69A, #2E8B57)' }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={onCancelEditingDescription}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : description ? (
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2,
                  background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Description:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {description}
                </Typography>
              </Paper>
            ) : null}
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
          My Tasks
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            onClick={onUploadTasks}
            sx={{
              borderColor: '#4ECDC4',
              color: '#4ECDC4',
              '&:hover': { 
                borderColor: '#26A69A',
                backgroundColor: 'rgba(76, 205, 196, 0.08)'
              }
            }}
          >
            Upload Tasks
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={onAddTask}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              '&:hover': { background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)' }
            }}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <AssignmentIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {todos.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <RadioButtonUncheckedIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {activeCount}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {completedCount}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
        {['all', 'active', 'completed'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'contained' : 'outlined'}
            onClick={() => setFilter(filterType)}
            size="small"
            sx={{
              textTransform: 'capitalize',
              ...(filter === filterType && {
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                '&:hover': { background: 'linear-gradient(45deg, #26A69A, #2E8B57)' }
              })
            }}
          >
            {filterType} ({
              filterType === 'all' ? todos.length :
              filterType === 'active' ? activeCount :
              completedCount
            })
          </Button>
        ))}
      </Box>

      {/* Tasks List */}
      {filteredTodos.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {filter === 'all' ? 'No tasks yet' :
               filter === 'active' ? 'No active tasks' :
               'No completed tasks'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filter === 'all' ? 'Create your first task to get started!' :
               filter === 'active' ? 'All tasks are completed!' :
               'Complete some tasks to see them here.'}
            </Typography>
            {filter === 'all' && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={onAddTask}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                  '&:hover': { background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)' }
                }}
              >
                Add Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredTodos.map((todo) => (
            <TaskItem key={todo.id} todo={todo} />
          ))}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          '&:hover': { 
            background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={onAddTask}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TodoList;
