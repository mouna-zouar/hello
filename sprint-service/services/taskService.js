const axios = require('axios');

const getTasksBySprintId = async (sprintId) => {
    try {
        const response = await axios.get(`http://localhost:3006/api/tasks?sprintId=${sprintId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches du sprint ${sprintId}:`, error.message);
        return null;
    }
};

const updateTaskSprint = async (taskId, sprintId, projectId) => {
    try {
        const response = await axios.put(`http://localhost:3006/api/tasks/${taskId}`, {
            sprintId: sprintId,
            projectId: projectId
        });

        console.log(`Tâche ${taskId} mise à jour avec sprintId ${sprintId} et projectId ${projectId}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la tâche ${taskId}:`, error.message);
    }
};


module.exports = { getTasksBySprintId ,updateTaskSprint};
