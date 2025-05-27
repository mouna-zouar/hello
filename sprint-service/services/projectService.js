const axios = require('axios');

const getProjectById = async (projectId) => {
    try {
        const response = await axios.get(`http://localhost:3004/api/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du projet ${projectId}:`, error.message);
        return null;
    }
};
const  updateProjectStatusService = async (projectId, status) => {
    try {
        const response = await axios.put(`http://localhost:3004/api/projects/${projectId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du projet:', error);
        throw new Error('Erreur lors de la mise à jour du statut du projet');
    }
};
module.exports = { getProjectById, updateProjectStatusService };
