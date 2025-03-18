// /validators/BacklogValidator.js
const { z } = require('zod');

const backlogSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    projectId: z.union([
        z.string().regex(/^\d+$/, "projectId doit être un entier sous forme de string"),
        z.number()
    ]),
});

module.exports = {
    backlogSchema,
};
