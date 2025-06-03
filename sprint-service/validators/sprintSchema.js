// sprintSchema.js
const { z } = require('zod');

const createSprintSchema = z.object({
    name: z.string().min(1, { message: "Le nom est requis." }), // Le nom est requis

 projectId: z.preprocess(val => Number(val), z.number()),
  backlogId: z.preprocess(val => Number(val), z.number()),});

const updateSprintSchema = z.object({
    name: z.string().optional(),
    projectId: z.number().int().positive().optional(),
    backlogId: z.number().int().positive().optional()
});

module.exports = { createSprintSchema, updateSprintSchema };
