const axios = require('axios');

const getBacklogById = async (backlogId) => {
    try {
        const response = await axios.get(`http://localhost:3008/api/backlogs/${backlogId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du backlog ${backlogId}:`, error.message);
        return null;
    }
};
module.exports = { getBacklogById };
