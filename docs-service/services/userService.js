const axios = require('axios');

const getUserById = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

const getAllUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/api/users`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error.message);
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
};

module.exports = { getUserById, getAllUsers };
