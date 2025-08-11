import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import FileUploader from './FileUploader';

export const Teams = ({ darkMode }) => {
  const [teams, setTeams] = React.useState(() => {
    const savedTeams = localStorage.getItem('teams');
    return savedTeams ? JSON.parse(savedTeams) : [];
  });
  const [isCreateTeamOpen, setIsCreateTeamOpen] = React.useState(false);
  const [newTeam, setNewTeam] = React.useState({ name: '', description: '' });
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(null);
  const [newMember, setNewMember] = React.useState({ name: '', role: '', email: '' });
  const [isEditTeamOpen, setIsEditTeamOpen] = React.useState(null);
  const [editTeam, setEditTeam] = React.useState({ name: '', description: '' });

  // Save teams to localStorage whenever teams state changes
  React.useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  const handleCreateTeam = () => {
    if (newTeam.name.trim()) {
      const team = {
        id: Date.now(),
        name: newTeam.name,
        description: newTeam.description,
        members: [],
        projectCount: 0,
        tasksCompleted: 0
      };
      setTeams([...teams, team]);
      setNewTeam({ name: '', description: '' });
      setIsCreateTeamOpen(false);
    }
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const handleAddMember = (teamId) => {
    if (newMember.name.trim() && newMember.email.trim()) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
      const member = {
        name: newMember.name,
        avatar: newMember.name.charAt(0).toUpperCase(),
        color: colors[Math.floor(Math.random() * colors.length)],
        role: newMember.role || 'Team Member',
        email: newMember.email
      };
      
      setTeams(teams.map(team => 
        team.id === teamId 
          ? { ...team, members: [...team.members, member] }
          : team
      ));
      
      setNewMember({ name: '', role: '', email: '' });
      setIsAddMemberOpen(null);
    }
  };

  const handleRemoveMember = (teamId, memberIndex) => {
    setTeams(teams.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter((_, index) => index !== memberIndex) }
        : team
    ));
  };

  const handleEditTeam = (team) => {
    setEditTeam({ name: team.name, description: team.description });
    setIsEditTeamOpen(team.id);
  };

  const handleUpdateTeam = () => {
    if (editTeam.name.trim()) {
      setTeams(teams.map(team => 
        team.id === isEditTeamOpen 
          ? { ...team, name: editTeam.name, description: editTeam.description }
          : team
      ));
      setEditTeam({ name: '', description: '' });
      setIsEditTeamOpen(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
          Teams
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          onClick={() => setIsCreateTeamOpen(true)}
        >
          Create Team
        </Button>
      </Box>

      {teams.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <GroupsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: darkMode ? 'white' : '#333' }}>
            No Teams Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first team to start collaborating with your colleagues.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setIsCreateTeamOpen(true)}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Create Your First Team
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {teams.map((team) => (
            <Grid item xs={12} lg={6} key={team.id}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#333' }}>
                        {team.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {team.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" sx={{ mr: 1 }} onClick={() => handleEditTeam(team)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTeam(team.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                        {team.members.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Members</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                        {team.projectCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Projects</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                        {team.tasksCompleted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Tasks Done</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
                      Team Members
                    </Typography>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />} 
                      onClick={() => setIsAddMemberOpen(team.id)}
                      sx={{ color: '#4ECDC4' }}
                    >
                      Add Member
                    </Button>
                  </Box>

                  {team.members.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #e0e0e0', borderRadius: 2 }}>
                      <PersonIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No team members yet. Add the first member to get started.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {team.members.map((member, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: member.color, width: 36, height: 36 }}>
                              {member.avatar}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={member.name}
                            secondary={`${member.role} • ${member.email}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip label="Active" color="success" size="small" sx={{ mr: 1 }} />
                            <IconButton size="small" color="error" onClick={() => handleRemoveMember(team.id, index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)', color: 'white', fontWeight: 'bold' }}>
          Create New Team
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={newTeam.name}
            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTeam.description}
            onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
            placeholder="What does this team work on?"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsCreateTeamOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTeam} 
            variant="contained"
            disabled={!newTeam.name.trim()}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={!!isAddMemberOpen} onClose={() => setIsAddMemberOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)', color: 'white', fontWeight: 'bold' }}>
          Add Team Member
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={newMember.name}
            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Role"
            fullWidth
            variant="outlined"
            value={newMember.role}
            onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            placeholder="e.g., Developer, Designer, Manager"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email Address"
            fullWidth
            variant="outlined"
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsAddMemberOpen(null)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={() => handleAddMember(isAddMemberOpen)} 
            variant="contained"
            disabled={!newMember.name.trim() || !newMember.email.trim()}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!isEditTeamOpen} onClose={() => setIsEditTeamOpen(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)', color: 'white', fontWeight: 'bold' }}>
          Edit Team
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            variant="outlined"
            value={editTeam.name}
            onChange={(e) => setEditTeam({...editTeam, name: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editTeam.description}
            onChange={(e) => setEditTeam({...editTeam, description: e.target.value})}
            placeholder="What does this team work on?"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditTeamOpen(null)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateTeam} 
            variant="contained"
            disabled={!editTeam.name.trim()}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Update Team
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export const Documents = ({ todos = [], taskDescriptions = {}, darkMode }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploadedDocuments, setUploadedDocuments] = React.useState([]);
  const { currentUser } = useAuth();

  // Load uploaded documents on component mount
  React.useEffect(() => {
    if (currentUser) {
      loadUploadedDocuments();
    }
  }, [currentUser]);

  const loadUploadedDocuments = async () => {
    try {
      const q = query(
        collection(db, 'Documents'),
        where('uploadedBy', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() || new Date(data.uploadedAt) || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date()
        });
      });
      setUploadedDocuments(documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleUploadComplete = (newFiles) => {
    setUploadedDocuments(prev => [...prev, ...newFiles]);
    setUploadDialogOpen(false);
  };
  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Helper function to categorize tasks
  const categorizeTask = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('meeting') || lowerText.includes('call') || lowerText.includes('discuss')) return 'Meetings';
    if (lowerText.includes('design') || lowerText.includes('ui') || lowerText.includes('ux')) return 'Design';
    if (lowerText.includes('code') || lowerText.includes('develop') || lowerText.includes('fix') || lowerText.includes('bug')) return 'Development';
    if (lowerText.includes('project') || lowerText.includes('plan') || lowerText.includes('manage')) return 'Projects';
    if (lowerText.includes('budget') || lowerText.includes('finance') || lowerText.includes('cost')) return 'Finance';
    return 'General';
  };

  // Create documents from tasks with descriptions
  const taskDocuments = todos
    .filter(todo => taskDescriptions[todo.id] && taskDescriptions[todo.id].trim())
    .map(todo => {
      const description = taskDescriptions[todo.id];
      const createdDate = todo.createdAt?.toDate ? todo.createdAt.toDate() : new Date(todo.createdAt);
      const timeAgo = getTimeAgo(createdDate);
      const category = categorizeTask(todo.text);
      
      return {
        name: `${todo.text.substring(0, 30)}${todo.text.length > 30 ? '...' : ''}.md`,
        type: "markdown",
        size: `${Math.ceil(description.length / 1024)} KB`,
        modified: timeAgo,
        folder: category,
        taskId: todo.id,
        completed: todo.completed,
        fullDescription: description,
        originalTask: todo.text
      };
    });

  // Create folder statistics
  const folderStats = taskDocuments.reduce((acc, doc) => {
    acc[doc.folder] = (acc[doc.folder] || 0) + 1;
    return acc;
  }, {});

  const folders = [
    { name: "Projects", count: folderStats.Projects || 0, color: "#4ECDC4" },
    { name: "Design", count: folderStats.Design || 0, color: "#FF6B6B" },
    { name: "Development", count: folderStats.Development || 0, color: "#45B7D1" },
    { name: "Meetings", count: folderStats.Meetings || 0, color: "#96CEB4" },
    { name: "Finance", count: folderStats.Finance || 0, color: "#FECA57" },
    { name: "General", count: folderStats.General || 0, color: "#A55EEA" }
  ].filter(folder => folder.count > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: darkMode ? 'white' : '#333' }}>
          Documents
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />} 
          sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload File
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {folders.map((folder, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: folder.color, width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <FolderIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: darkMode ? 'white' : '#333' }}>
                  {folder.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {folder.count} files
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Uploaded Documents Section */}
      {uploadedDocuments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
              Uploaded Files ({uploadedDocuments.length})
            </Typography>
            <List>
              {uploadedDocuments.map((doc, index) => (
                <React.Fragment key={doc.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: '#4ECDC4', 
                        color: 'white'
                      }}>
                        <FileIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {doc.name}
                          </Typography>
                          <Chip label={doc.category} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {(doc.size / 1024).toFixed(1)} KB • Uploaded {getTimeAgo(doc.uploadedAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        title="Download File"
                        onClick={() => window.open(doc.downloadURL, '_blank')}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton size="small" color="error" title="Delete File">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < uploadedDocuments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Task Documents Section */}
      {taskDocuments.length === 0 && uploadedDocuments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: darkMode ? 'white' : '#333' }}>
            No Documents Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Upload files or add descriptions to your tasks to see documents here.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />} 
            onClick={() => setUploadDialogOpen(true)}
            sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}
          >
            Upload Your First File
          </Button>
        </Paper>
      ) : (
        taskDocuments.length > 0 && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                Task Documents ({taskDocuments.length})
              </Typography>
              <List>
                {taskDocuments.map((doc, index) => (
                  <React.Fragment key={doc.taskId}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: doc.completed ? '#4CAF50' : '#f5f5f5', 
                          color: doc.completed ? 'white' : '#666' 
                        }}>
                          <FileIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {doc.name}
                            </Typography>
                            {doc.completed && (
                              <Chip label="Completed" size="small" color="success" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {doc.folder} • {doc.size} • Modified {doc.modified}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '400px'
                            }}>
                              Task: {doc.originalTask}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" title="View Task Description">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" title="Delete Task">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < taskDocuments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )
      )}

      {/* File Uploader Dialog */}
      <FileUploader 
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadComplete={handleUploadComplete}
        darkMode={darkMode}
      />
    </Box>
  );
};

export const Settings = ({ darkMode, onToggleDarkMode }) => {
  const [localSettings, setLocalSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
    profileVisibility: true,
    activityStatus: false
  });

  const handleSettingToggle = (settingKey) => {
    setLocalSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const settingsSections = [
    {
      title: "Account Settings",
      settings: [
        { 
          name: "Email Notifications", 
          description: "Receive email notifications for important updates", 
          checked: localSettings.emailNotifications, 
          icon: <EmailIcon />, 
          action: () => handleSettingToggle('emailNotifications')
        },
        { 
          name: "Push Notifications", 
          description: "Get push notifications on your device", 
          checked: localSettings.pushNotifications, 
          icon: <NotificationsIcon />, 
          action: () => handleSettingToggle('pushNotifications')
        },
        { 
          name: "Two-Factor Authentication", 
          description: "Add an extra layer of security", 
          checked: localSettings.twoFactorAuth, 
          icon: <SecurityIcon />, 
          action: () => handleSettingToggle('twoFactorAuth')
        }
      ]
    },
    {
      title: "Appearance",
      settings: [
        { name: "Dark Mode", description: "Switch between light and dark themes", checked: darkMode, icon: <PaletteIcon />, action: onToggleDarkMode },
        { name: "Language", description: "Choose your preferred language", checked: false, icon: <LanguageIcon />, value: "English" }
      ]
    },
    {
      title: "Privacy",
      settings: [
        { 
          name: "Profile Visibility", 
          description: "Control who can see your profile", 
          checked: localSettings.profileVisibility, 
          icon: <PersonIcon />, 
          action: () => handleSettingToggle('profileVisibility')
        },
        { 
          name: "Activity Status", 
          description: "Show when you're active", 
          checked: localSettings.activityStatus, 
          icon: <PersonIcon />, 
          action: () => handleSettingToggle('activityStatus')
        }
      ]
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: darkMode ? 'white' : '#333' }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {settingsSections.map((section, sectionIndex) => (
          <Grid item xs={12} lg={6} key={sectionIndex}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkMode ? 'white' : '#333' }}>
                  {section.title}
                </Typography>
                <List sx={{ p: 0 }}>
                  {section.settings.map((setting, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'rgba(76, 205, 196, 0.1)', color: '#4ECDC4', width: 36, height: 36 }}>
                            {setting.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={setting.name}
                          secondary={setting.description}
                        />
                        <ListItemSecondaryAction>
                          {setting.value ? (
                            <Chip label={setting.value} variant="outlined" />
                          ) : (
                            <Switch
                              checked={setting.checked}
                              onChange={setting.action || (() => {})}
                              color="primary"
                            />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < section.settings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
