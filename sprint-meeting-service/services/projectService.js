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
module.exports = { getProjectById };

