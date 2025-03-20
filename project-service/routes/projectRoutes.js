// routes/projectRoutes.js

/**
 * @swagger
 * tags:
 *   - name: Project
 *     description: Gestion des projets
 */

const express = require('express');
const projectController = require('../controllers/projectController');
const checkPermission = require('../middlewares/check');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Créer un projet
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               teamId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Projet créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/', projectController.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Récupérer tous les projets
 *     tags: [Project]
 *     responses:
 *       200:
 *         description: Liste des projets
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware, checkPermission("Project", "VIEW"), projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Récupérer un projet par son ID
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du projet
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails du projet
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authMiddleware, checkPermission("Project", "VIEW"), projectController.getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Mettre à jour un projet
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du projet
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
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               teamId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Projet mis à jour avec succès
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authMiddleware, checkPermission("Project", "UPDATE"), projectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Supprimer un projet
 *     tags: [Project]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du projet
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projet supprimé avec succès
 *       404:
 *         description: Projet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware, checkPermission("Project", "DELETE"), projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{projectId}/assign/{teamId}:
 *   put:
 *     summary: Assigner un projet à une équipe
 *     tags: [Project]
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID du projet
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
 *         description: Projet assigné à l'équipe avec succès
 *       404:
 *         description: Projet ou équipe non trouvés
 *       500:
 *         description: Erreur serveur
 */
router.put('/projects/:projectId/assign/:teamId', authMiddleware, checkPermission("Project", "UPDATE"), projectController.assignProjectToTeam);

module.exports = router;
