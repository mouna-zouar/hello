const axios = require('axios');

const getEmployeeById = async (employeeId) => {
    try {
        const url = `http://localhost:3002/employees/${employeeId}`;
        console.log(`🔍 Requête envoyée à : ${url}`);
        const response = await axios.get(url);
        if (response.data) {
            return response.data;
        } else {
            return new Error("Employé non trouvé");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'employé:", error);
        throw error;
    }
};

const updateEmployee = async (employeeId, updatedData) => {
    try {
        const url = `http://localhost:3002/employees/${employeeId}`;
        console.log(`🔧 Requête envoyée à : ${url}`);
        const response = await axios.put(url, updatedData);
        if (response.data) {
            return response.data;
        } else {
            return new Error("Échec de la mise à jour de l'employé");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'employé:", error);
        throw error;
    }
};

module.exports = { getEmployeeById, updateEmployee };
