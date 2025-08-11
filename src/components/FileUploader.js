import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const FileUploader = ({ open, onClose, darkMode, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  };

  const handleFileSelection = (files) => {
    const validFiles = files.filter(file => {
      // Max file size: 50MB
      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }))]);
    setError('');
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    return <FileIcon />;
  };

  const getCategoryFromType = (fileName, fileType) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'Images';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'Documents';
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(extension)) return 'Videos';
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'Audio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'Archives';
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(extension)) return 'Code';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'Spreadsheets';
    if (['ppt', 'pptx'].includes(extension)) return 'Presentations';
    
    return 'General';
  };

  const uploadFiles = async () => {
    if (!currentUser) {
      setError('You must be logged in to upload files');
      return;
    }

    setUploading(true);
    setError('');
    const uploadedResults = [];

    try {
      for (const fileObj of selectedFiles) {
        const { file, name } = fileObj;
        
        // Create a storage reference
        const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${name}`);
        
        try {
          // Upload the file
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));
          
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

          // Create document metadata in Firestore
          const documentData = {
            name: name,
            originalName: name,
            size: file.size,
            type: file.type,
            category: getCategoryFromType(name, file.type),
            downloadURL: downloadURL,
            storagePath: snapshot.ref.fullPath,
            uploadedBy: currentUser.uid,
            uploadedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            isTaskDocument: false
          };

          const docRef = await addDoc(collection(db, 'Documents'), documentData);
          
          uploadedResults.push({
            id: docRef.id,
            ...documentData,
            uploadedAt: new Date(),
            createdAt: new Date()
          });

        } catch (fileError) {
          console.error(`Error uploading ${name}:`, fileError);
          setError(`Failed to upload ${name}: ${fileError.message}`);
        }
      }

      setUploadedFiles(uploadedResults);
      
      // Call the callback function to refresh the documents list
      if (onUploadComplete) {
        onUploadComplete(uploadedResults);
      }

      // Show success message
      if (uploadedResults.length > 0) {
        console.log(`Successfully uploaded ${uploadedResults.length} files`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setUploadedFiles([]);
      setUploadProgress({});
      setError('');
      onClose();
    }
  };

  const handleUploadAnother = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
    setUploadProgress({});
    setError('');
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
        color: 'white',
        fontWeight: 'bold'
      }}>
        Upload Files
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
          disabled={uploading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {uploadedFiles.length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon /> Upload Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Successfully uploaded {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}.
            </Typography>
            <List>
              {uploadedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • ${file.category}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Uploaded" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            {/* File Drop Zone */}
            <Box
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${isDragOver ? '#4ECDC4' : '#ddd'}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragOver ? 'rgba(76, 205, 196, 0.1)' : 'rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                mb: 3,
                '&:hover': {
                  backgroundColor: 'rgba(76, 205, 196, 0.05)',
                  borderColor: '#4ECDC4'
                }
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: '#4ECDC4', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Drop files here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Support for any file type • Maximum 50MB per file
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Selected Files ({selectedFiles.length})
                </Typography>
                <List>
                  {selectedFiles.map((fileObj) => (
                    <ListItem key={fileObj.id}>
                      <ListItemIcon>
                        {getFileIcon(fileObj.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={fileObj.name}
                        secondary={`${formatFileSize(fileObj.size)} • ${getCategoryFromType(fileObj.name, fileObj.type)}`}
                      />
                      {uploading && uploadProgress[fileObj.id] !== undefined && (
                        <Box sx={{ width: 100, mr: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[fileObj.id]} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}
                      <ListItemSecondaryAction>
                        {!uploading && (
                          <IconButton 
                            edge="end" 
                            onClick={() => removeFile(fileObj.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {uploadProgress[fileObj.id] === 100 && (
                          <CheckCircleIcon color="success" />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {uploadedFiles.length > 0 ? (
          <>
            <Button
              onClick={handleUploadAnother}
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Upload More Files
            </Button>
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
              }}
            >
              Done
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              variant="contained"
              disabled={selectedFiles.length === 0 || uploading}
              sx={{
                background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
              }}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FileUploader;
