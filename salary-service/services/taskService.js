const axios = require('axios');

const getTasksByEmployee = async (employeeId) => {
    try {
        const url = `http://localhost:3006/api/tasks/assignedTo/${employeeId}`;
        console.log(`📡 Requête envoyée à : ${url}`);
        const response = await axios.get(url);

        if (response.data && response.data.error) {
            console.error('Erreur:', response.data.error);
            throw new Error(response.data.error);
        }

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error.message);
        throw error;
    }
};


module.exports = { getTasksByEmployee};
