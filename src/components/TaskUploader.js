import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const UploadArea = styled(Box)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease, background-color 0.3s ease',
  backgroundColor: isDragOver ? `${theme.palette.primary.main}10` : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}05`,
  },
}));

const TaskUploader = ({ open, onClose, onTasksUpload, darkMode }) => {
  const [files, setFiles] = useState([]);
  const [parsedTasks, setParsedTasks] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewTask, setPreviewTask] = useState(null);

  const supportedFormats = {
    text: ['.txt', '.csv', '.json', '.md', '.rtf'],
    images: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'],
    documents: ['.doc', '.docx', '.pdf', '.odt', '.pages'],
    spreadsheets: ['.xls', '.xlsx', '.ods'],
    other: ['.zip', '.rar', '.tar', '.gz']
  };
  
  const allSupportedFormats = Object.values(supportedFormats).flat();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return allSupportedFormats.includes(extension);
    });

    if (validFiles.length !== fileList.length) {
      const supportedList = Object.entries(supportedFormats)
        .map(([category, formats]) => `${category}: ${formats.join(', ')}`)
        .join(' | ');
      setError(`Some files were skipped. Supported formats: ${supportedList}`);
    } else {
      setError('');
    }

    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending',
      tasks: [],
      category: getFileCategory(file.name)
    }));

    setFiles(prev => [...prev, ...newFiles]);

    validFiles.forEach(file => parseFile(file));
  };

  const getFileCategory = (fileName) => {
    const extension = '.' + fileName.split('.').pop().toLowerCase();
    for (const [category, formats] of Object.entries(supportedFormats)) {
      if (formats.includes(extension)) {
        return category;
      }
    }
    return 'other';
  };

  const parseFile = async (file) => {
    try {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const category = getFileCategory(file.name);
      let tasks = [];

      if (category === 'text') {
        const text = await file.text();
        switch (extension) {
          case '.txt':
          case '.md':
          case '.rtf':
            tasks = parsePlainText(text);
            break;
          case '.csv':
            tasks = parseCSV(text);
            break;
          case '.json':
            tasks = parseJSON(text);
            break;
          default:
            throw new Error('Unsupported text file format');
        }
      } else {
        // For non-text files, create a single task representing the file itself
        tasks = [{
          id: `file-${Date.now()}-${Math.random()}`,
          text: `Review ${file.name}`,
          description: `${category} file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          completed: false,
          source: 'file-upload',
          fileType: category,
          fileName: file.name,
          fileSize: file.size
        }];
      }

      setFiles(prev => prev.map(f => 
        f.file.name === file.name 
          ? { ...f, status: 'success', tasks }
          : f
      ));

      setParsedTasks(prev => [...prev, ...tasks]);

    } catch (err) {
      setFiles(prev => prev.map(f => 
        f.file.name === file.name 
          ? { ...f, status: 'error', error: err.message }
          : f
      ));
      console.error('Error parsing file:', err);
    }
  };

  const parsePlainText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      // Remove common list markers
      const cleanLine = line.replace(/^[-*+•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      
      // Extract due date if present (looking for patterns like "by 2024-01-15" or "due: tomorrow")
      const dueDateMatch = cleanLine.match(/\b(by|due:?)\s+([^\s,]+(?:\s+[^\s,]+)?)/i);
      let taskText = cleanLine;
      let dueDate = null;

      if (dueDateMatch) {
        const dateStr = dueDateMatch[2];
        taskText = cleanLine.replace(dueDateMatch[0], '').trim();
        
        // Try to parse the date
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
        }
      }

      return {
        id: `imported-${Date.now()}-${index}`,
        text: taskText,
        dueDate,
        completed: false,
        source: 'file-upload',
        originalLine: line
      };
    });
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const taskIndex = headers.findIndex(h => h.includes('task') || h.includes('todo') || h.includes('title'));
    const dueDateIndex = headers.findIndex(h => h.includes('due') || h.includes('date'));
    const descriptionIndex = headers.findIndex(h => h.includes('description') || h.includes('notes'));
    const completedIndex = headers.findIndex(h => h.includes('completed') || h.includes('done') || h.includes('status'));

    return lines.slice(1).map((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      let dueDate = null;
      if (dueDateIndex >= 0 && columns[dueDateIndex]) {
        const parsedDate = new Date(columns[dueDateIndex]);
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
        }
      }

      let completed = false;
      if (completedIndex >= 0 && columns[completedIndex]) {
        completed = ['true', 'yes', '1', 'completed', 'done'].includes(columns[completedIndex].toLowerCase());
      }

      return {
        id: `imported-${Date.now()}-${index}`,
        text: columns[taskIndex] || line,
        description: descriptionIndex >= 0 ? columns[descriptionIndex] : '',
        dueDate,
        completed,
        source: 'file-upload'
      };
    });
  };

  const parseJSON = (text) => {
    const data = JSON.parse(text);
    const tasks = Array.isArray(data) ? data : [data];

    return tasks.map((task, index) => {
      let dueDate = null;
      if (task.dueDate || task.due_date || task.deadline) {
        const dateStr = task.dueDate || task.due_date || task.deadline;
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate;
        }
      }

      return {
        id: `imported-${Date.now()}-${index}`,
        text: task.title || task.task || task.text || task.name || JSON.stringify(task).substring(0, 50),
        description: task.description || task.notes || '',
        dueDate,
        completed: Boolean(task.completed || task.done || task.finished),
        source: 'file-upload'
      };
    });
  };

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      // Remove tasks from this file
      setParsedTasks(prev => prev.filter(task => 
        !task.id.includes(fileToRemove.file.name)
      ));
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUploadTasks = async () => {
    if (parsedTasks.length === 0) {
      setError('No tasks to upload. Please add some files first.');
      return;
    }

    setUploading(true);
    try {
      await onTasksUpload(parsedTasks);
      handleClose();
    } catch (err) {
      setError('Failed to upload tasks: ' + err.message);
    }
    setUploading(false);
  };

  const handleClose = () => {
    setFiles([]);
    setParsedTasks([]);
    setError('');
    setPreviewTask(null);
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <FileIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #4ECDC4, #44A08D)', 
          color: 'white', 
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon />
            Upload Tasks from File
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Upload Area */}
          <UploadArea
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: darkMode ? 'white' : '#333' }}>
              Drop files here or click to browse
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Supported formats:
              </Typography>
              {Object.entries(supportedFormats).map(([category, formats]) => (
                <Typography key={category} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <strong>{category.charAt(0).toUpperCase() + category.slice(1)}:</strong> {formats.join(', ')}
                </Typography>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Upload any supported file type. Text files will be parsed for tasks, while other files will be added as review tasks.
            </Typography>
            
            <input
              id="file-upload-input"
              type="file"
              multiple
              accept={allSupportedFormats.join(',')}
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </UploadArea>

          {/* File List */}
          {files.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: darkMode ? 'white' : '#333' }}>
                Uploaded Files ({files.length})
              </Typography>
              <List>
                {files.map((fileObj) => (
                  <ListItem 
                    key={fileObj.id}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(fileObj.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={fileObj.file.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {fileObj.file.size} bytes
                          </Typography>
                          {fileObj.status === 'success' && (
                            <Chip 
                              label={`${fileObj.tasks.length} tasks found`} 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }}
                            />
                          )}
                          {fileObj.status === 'error' && (
                            <Chip 
                              label={fileObj.error} 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Box>
                      {fileObj.status === 'success' && fileObj.tasks.length > 0 && (
                        <Tooltip title="Preview tasks">
                          <IconButton 
                            size="small" 
                            onClick={() => setPreviewTask(fileObj)}
                          >
                            <PreviewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Remove file">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeFile(fileObj.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Tasks Summary */}
          {parsedTasks.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: darkMode ? 'white' : '#333' }}>
                  Tasks Preview ({parsedTasks.length} total)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`${parsedTasks.filter(t => !t.completed).length} pending`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`${parsedTasks.filter(t => t.completed).length} completed`} 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    label={`${parsedTasks.filter(t => t.dueDate).length} with due dates`} 
                    color="info" 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  First few tasks: {parsedTasks.slice(0, 3).map(t => t.text).join(', ')}
                  {parsedTasks.length > 3 && '...'}
                </Typography>
              </CardContent>
            </Card>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Uploading tasks to your account...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleUploadTasks}
            variant="contained"
            disabled={parsedTasks.length === 0 || uploading}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Upload {parsedTasks.length} Tasks
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Preview Dialog */}
      <Dialog 
        open={!!previewTask} 
        onClose={() => setPreviewTask(null)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Tasks from {previewTask?.file.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {previewTask?.tasks.map((task, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={task.text}
                  secondary={
                    <Box>
                      {task.dueDate && (
                        <Typography variant="caption" color="primary">
                          Due: {task.dueDate.toLocaleDateString()}
                        </Typography>
                      )}
                      {task.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {task.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                {task.completed && (
                  <Chip label="Completed" size="small" color="success" />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskUploader;
