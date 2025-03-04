const axios = require('axios');

const getTasksBySprintId = async (sprintId) => {
    try {
        const response = await axios.get(`http://localhost:3006/api/tasks?sprintId=${sprintId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches du sprint ${sprintId}:`, error.message);
        return null;
    }
};

module.exports = { getTasksBySprintId };
