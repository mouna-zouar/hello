const axios = require('axios');

const getEmployeeById = async (employeeId) => {
    try {
        const url = `http://localhost:3012/employees/${employeeId}`;
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



module.exports = { getEmployeeById};
