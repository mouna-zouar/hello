const axios = require('axios');

const getProjectById = async (projectId) => {
    try {
        const response = await axios.get(`http://localhost:3004/api/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        throw new Error('Erreur lors de la récupération du projet');
    }
};

const updateProjectBacklogId = async (projectId, backlogId) => {
    try {
        const response = await axios.patch(`http://localhost:3004/api/projects/projects/${projectId}/backlog`, { backlogId });
        return response.data;
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du backlogId du projet:', error);
        throw new Error('Erreur lors de la mise à jour du backlogId du projet');
    }
};

module.exports = { getProjectById, updateProjectBacklogId };
