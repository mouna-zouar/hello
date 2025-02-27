const axios = require('axios');

const getUserById = async (userId) => {
    try {
        const baseUrl = process.env.AUTH_SERVICE_URL;
        const url = `${baseUrl}/api/users/${userId}`;

        console.log(`🔍 Requête envoyée à : ${url}`);

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(` Erreur API Auth Service: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
        } else if (error.request) {
            console.error(" Aucune réponse reçue du service Auth:", error.request);
        } else {
            console.error("Erreur lors de la requête:", error.message);
        }
        return null;
    }
};

module.exports = { getUserById };
