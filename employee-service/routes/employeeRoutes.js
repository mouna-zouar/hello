// routes/employeeRoutes.js
/**
 * @swagger
 * tags:
 *   - name: Employee
 *     description: Gestion des employés
 */

const express = require('express');
const employeeController = require("../controllers/employeeController");

const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/check');

const router = express.Router();

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Créer un nouvel employé
 *     tags: [Employee]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               position:
 *                 type: string
 *               hireDate:
 *                 type: string
 *                 format: date
 *               teamId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Employé créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/', employeeController.createEmployee);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Récupérer tous les employés
 *     tags: [Employee]
 *     responses:
 *       200:
 *         description: Liste des employés
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware, checkPermission("Employee", "VIEW"), employeeController.getAllEmployees);

/**
 * @swagger
 * /employees/{employeeId}:
 *   get:
 *     summary: Récupérer un employé par son ID
 *     tags: [Employee]
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'employé
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:employeeId', employeeController.getEmployeeById);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Mettre à jour les informations d'un employé
 *     tags: [Employee]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               position:
 *                 type: string
 *               hireDate:
 *                 type: string
 *                 format: date
 *               teamId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employé mis à jour avec succès
 *       404:
 *         description: Employé non trouvé
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authMiddleware, checkPermission("Employee", "UPDATE"), employeeController.updateEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Supprimer un employé
 *     tags: [Employee]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employé supprimé avec succès
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware, checkPermission("Employee", "DELETE"), employeeController.deleteEmployee);

/**
 * @swagger
 * /employees/team/employee:
 *   get:
 *     summary: Récupérer les employés d'une équipe
 *     tags: [Employee]
 *     parameters:
 *       - name: teamId
 *         in: query
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des employés dans l'équipe
 *       500:
 *         description: Erreur serveur
 */
router.get('/team/employee', authMiddleware, checkPermission("Employee", "VIEW"), employeeController.getEmployeesByTeamId);

/**
 * @swagger
 * /employees/assign/{employeeId}/{teamId}:
 *   put:
 *     summary: Assigner un employé à une équipe
 *     tags: [Employee]
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: integer
 *       - name: teamId
 *         in: path
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employé assigné à l'équipe
 *       404:
 *         description: Employé ou équipe non trouvés
 *       500:
 *         description: Erreur serveur
 */
router.put('/assign/:employeeId/:teamId', authMiddleware, checkPermission("Employee", "UPDATE"), async (req, res) => {
    const { employeeId, teamId } = req.params;

    try {
        const updatedEmployee = await employeeController.assignEmployeeToTeam(parseInt(employeeId), parseInt(teamId));
        res.status(200).json({
            message: `Employé ${employeeId} assigné à l'équipe ${teamId} avec succès`,
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'assignation de l'employé à l'équipe" });
    }
});

module.exports = router;
