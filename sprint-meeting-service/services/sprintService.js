const axios = require('axios');

const getSprintById = async (sprintId) => {
    try {
        const response = await axios.get(`http://localhost:3007/api/sprints/${sprintId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du sprint ${sprintId}:`, error.message);
        return null;
    }
};
module.exports = { getSprintById };
