const axios = require('axios');

const getTeamById = async (teamId) => {
    try {
        const response = await axios.get(`http://localhost:3005/api/teams/${teamId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'équipe:", error.message);
        throw new Error("Erreur lors de la récupération de l'équipe");
    }
};

module.exports = { getTeamById };
