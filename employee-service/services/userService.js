const axios = require('axios');


    const getUserById = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de l'équipe:", error.message);
            throw new Error("Erreur lors de la récupération de l'équipe");
        }
    };
    


module.exports = { getUserById };
