const axios = require('axios');

const employeeServiceUrl = "http://localhost:3002/employees"; // Ajuste l'URL de l'API Employé

const getEmployeeById = async (employeeId) => {
    try {
        const response = await axios.get(`${employeeServiceUrl}/${employeeId}`);
        return response.data; // Renvoie les données de l'employé
    } catch (error) {
        console.error("Erreur lors de la récupération de l'employé depuis le microservice :", error.message);
        throw new Error("Impossible de récupérer l'employé");
    }
};

module.exports = { getEmployeeById };
