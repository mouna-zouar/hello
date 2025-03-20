const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/check");

/**
 * @swagger
 * tags:
 *   name: Backlogs
 *   description: API de gestion des backlogs
 */

/**
 * @swagger
 * /backlogs:
 *   post:
 *     summary: Créer un backlog
 *     tags: [Backlogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - projectId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Backlog créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 backlog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     projectId:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Projet non trouvé via Kafka
 *       400:
 *         description: Erreur de validation des données
 *       500:
 *         description: Erreur serveur lors de la création du backlog
 */
router.post('/', backlogController.createBacklog);

/**
 * @swagger
 * /backlogs:
 *   get:
 *     summary: Récupérer tous les backlogs
 *     tags: [Backlogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des backlogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   projectId:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Erreur serveur lors de la récupération des backlogs
 */
router.get('/', authMiddleware, checkPermission("Backlog", "VIEW"), backlogController.getAllBacklogs);

/**
 * @swagger
 * /backlogs/{id}:
 *   get:
 *     summary: Récupérer un backlog par ID
 *     tags: [Backlogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du backlog
 *     responses:
 *       200:
 *         description: Backlog trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 projectId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Backlog non trouvé
 *       500:
 *         description: Erreur serveur lors de la récupération du backlog
 */
router.get('/:id', backlogController.getBacklogById);

/**
 * @swagger
 * /backlogs/{id}:
 *   put:
 *     summary: Mettre à jour un backlog
 *     tags: [Backlogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du backlog à mettre à jour
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
 *               projectId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Backlog mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 backlog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     projectId:
 *                       type: integer
 *       404:
 *         description: Backlog ou projet non trouvé
 *       400:
 *         description: Erreur de validation des données
 *       500:
 *         description: Erreur serveur lors de la mise à jour du backlog
 */
router.put('/:id', authMiddleware, checkPermission("Backlog", "UPDATE"), backlogController.updateBacklog);

/**
 * @swagger
 * /backlogs/{id}:
 *   delete:
 *     summary: Supprimer un backlog
 *     tags: [Backlogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du backlog à supprimer
 *     responses:
 *       200:
 *         description: Backlog supprimé avec succès
 *       404:
 *         description: Backlog non trouvé
 *       500:
 *         description: Erreur serveur lors de la suppression du backlog
 */
router.delete('/:id', authMiddleware, checkPermission("Backlog", "DELETE"), backlogController.deleteBacklog);

module.exports = router;
