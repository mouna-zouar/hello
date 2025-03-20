const express = require('express');
const teamController = require('../controllers/teamController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /teams/{teamId}/employees:
 *   get:
 *     summary: Récupérer les employés d'une équipe par ID
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des employés de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Aucun employé trouvé pour cette équipe
 *       500:
 *         description: Erreur serveur
 */
router.get('/:teamId/employees', authMiddleware, checkPermission("Team", "VIEW"), teamController.getEmployeesByTeamId);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Créer une nouvelle équipe
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'équipe
 *                 example: "Equipe Dev"
 *     responses:
 *       201:
 *         description: Équipe créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: L'équipe avec ce nom existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post('/', teamController.createTeam);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Récupérer toutes les équipes
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Liste de toutes les équipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', teamController.getAllTeams);

/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     summary: Récupérer une équipe par son ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:teamId', teamController.getTeamById);

/**
 * @swagger
 * /teams/{teamId}:
 *   put:
 *     summary: Mettre à jour les détails d'une équipe
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de l'équipe
 *     responses:
 *       200:
 *         description: Équipe mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:teamId', authMiddleware, checkPermission("Team", "UPDATE"), teamController.updateTeam);

/**
 * @swagger
 * /teams/{teamId}:
 *   delete:
 *     summary: Supprimer une équipe par son ID
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Équipe supprimée avec succès
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:teamId', authMiddleware, checkPermission("Team", "DELETE"), teamController.deleteTeam);

/**
 * @swagger
 * /teams/search:
 *   get:
 *     summary: Rechercher des équipes par nom
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: Le nom de l'équipe à rechercher
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des équipes correspondantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       400:
 *         description: Nom de l'équipe requis
 *       500:
 *         description: Erreur serveur
 */
router.get('/search', authMiddleware, checkPermission("Team", "VIEW"), teamController.searchTeamByName);

/**
 * @swagger
 * /teams/assign/{employeeId}/{teamId}:
 *   put:
 *     summary: Assigner un employé à une équipe
 *     tags: [Team]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         description: ID de l'équipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employé assigné à l'équipe avec succès
 *       404:
 *         description: Employé ou équipe non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/assign/:employeeId/:teamId', authMiddleware, checkPermission("Team", "UPDATE"), teamController.assignEmployeeToTeam);

module.exports = router;
