const axios = require('axios');

const createDefaultColumns = async (projectId) => {
    try {
        const url = `http://localhost:3006/api/columns/default`; 
        console.log(`📡 Création des colonnes par défaut pour le projet ${projectId} via ${url}`);

        const response = await axios.post(url, { projectId });

        if (response.status !== 201) {
            throw new Error('Échec de la création des colonnes');
        }

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création des colonnes par défaut:', error.message);
        throw error;
    }
};


module.exports = { createDefaultColumns};