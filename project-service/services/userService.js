const axios = require('axios');

const getUserById = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du backlog ${userId}:`, error.message);
        return null;
    }
};
module.exports = { getUserById };
