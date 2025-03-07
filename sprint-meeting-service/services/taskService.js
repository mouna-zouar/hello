const axios = require('axios');

const getTaskById = async (taskId) => {
    try {
        const response = await axios.get(`http://localhost:3006/api/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du task ${taskId}:`, error.message);
        return null;
    }
};
module.exports = { getTaskById };


