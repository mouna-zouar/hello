// sprintSchema.js
const { z } = require('zod');

const createSprintSchema = z.object({
    name: z.string().min(1, { message: "Le nom est requis." }),
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Date de début invalide." }),
    endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Date de fin invalide." }),
    projectId: z.number().int().positive({ message: "ID du projet doit être un entier positif." }),
    backlogId: z.number().int().positive({ message: "ID du backlog doit être un entier positif." })
});

const updateSprintSchema = z.object({
    name: z.string().optional(),
    startDate: z.string().optional().refine(val => !isNaN(Date.parse(val)), { message: "Date de début invalide." }),
    endDate: z.string().optional().refine(val => !isNaN(Date.parse(val)), { message: "Date de fin invalide." }),
    projectId: z.number().int().positive().optional(),
    backlogId: z.number().int().positive().optional()
});

module.exports = { createSprintSchema, updateSprintSchema };
