const { z } =require ('zod');

const projectSchema = z.object({
    name: z.string().min(1, 'Le nom du projet est requis'),
    description: z.string().optional(),
    type: z.string().min(1, 'Le type de projet est requis'),
    teamId: z.union([
        z.string().regex(/^\d+$/, 'teamId doit être un entier sous forme de string'),
        z.number()
    ]).optional(),
    backlogId: z.union([
        z.string().regex(/^\d+$/, 'backlogId doit être un entier sous forme de string'),
        z.number()
    ]).optional(),
    userId: z.union([
        z.string().regex(/^\d+$/, 'userId doit être un entier sous forme de string'),
        z.number()
    ]).optional(),
    status: z.string().default('ONGOING'),
});
module.exports = {
    projectSchema,
};