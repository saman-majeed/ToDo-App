import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Projects Service
export const projectsService = {
  // Get all projects for a user
  getUserProjects: (userId, callback) => {
    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, callback);
  },

  // Create a new project
  createProject: async (projectData) => {
    return await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Update a project
  updateProject: async (projectId, updateData) => {
    const projectRef = doc(db, 'projects', projectId);
    return await updateDoc(projectRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a project
  deleteProject: async (projectId) => {
    return await deleteDoc(doc(db, 'projects', projectId));
  },

  // Get project by ID
  getProject: async (projectId) => {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }
};

// Teams Service
export const teamsService = {
  // Get all teams for a user
  getUserTeams: (userId, callback) => {
    const q = query(
      collection(db, 'teams'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, callback);
  },

  // Create a new team
  createTeam: async (teamData) => {
    return await addDoc(collection(db, 'teams'), {
      ...teamData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Update a team
  updateTeam: async (teamId, updateData) => {
    const teamRef = doc(db, 'teams', teamId);
    return await updateDoc(teamRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a team
  deleteTeam: async (teamId) => {
    return await deleteDoc(doc(db, 'teams', teamId));
  },

  // Add member to team
  addTeamMember: async (teamId, userId) => {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    const currentMembers = teamDoc.data().members || [];
    
    if (!currentMembers.includes(userId)) {
      await updateDoc(teamRef, {
        members: [...currentMembers, userId],
        updatedAt: serverTimestamp()
      });
    }
  },

  // Remove member from team
  removeTeamMember: async (teamId, userId) => {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    const currentMembers = teamDoc.data().members || [];
    
    await updateDoc(teamRef, {
      members: currentMembers.filter(id => id !== userId),
      updatedAt: serverTimestamp()
    });
  }
};

// Documents Service
export const documentsService = {
  // Get all documents for a user
  getUserDocuments: (userId, callback) => {
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, callback);
  },

  // Create a new document
  createDocument: async (documentData) => {
    return await addDoc(collection(db, 'documents'), {
      ...documentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // Update a document
  updateDocument: async (documentId, updateData) => {
    const docRef = doc(db, 'documents', documentId);
    return await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    return await deleteDoc(doc(db, 'documents', documentId));
  }
};

// Time Tracking Service
export const timeTrackingService = {
  // Get time entries for a user
  getUserTimeEntries: (userId, callback) => {
    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );
    return onSnapshot(q, callback);
  },

  // Start time tracking
  startTimeTracking: async (userId, projectId, taskId = null) => {
    return await addDoc(collection(db, 'timeEntries'), {
      userId,
      projectId,
      taskId,
      startTime: serverTimestamp(),
      isActive: true,
      createdAt: serverTimestamp()
    });
  },

  // Stop time tracking
  stopTimeTracking: async (timeEntryId) => {
    const timeEntryRef = doc(db, 'timeEntries', timeEntryId);
    return await updateDoc(timeEntryRef, {
      endTime: serverTimestamp(),
      isActive: false,
      updatedAt: serverTimestamp()
    });
  }
};

// Users Service
export const usersService = {
  // Get user profile
  getUserProfile: async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // Update user profile
  updateUserProfile: async (userId, updateData) => {
    const userRef = doc(db, 'users', userId);
    return await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  },

  // Search users by email
  searchUsersByEmail: async (email) => {
    const q = query(
      collection(db, 'users'),
      where('email', '>=', email),
      where('email', '<=', email + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
