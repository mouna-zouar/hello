const { z } =require ('zod');

const employeeSchema = z.object({
    position: z.string().min(1, 'La position est requise'),
    hireDate: z.string().optional(),
    teamId: z.union([z.string().regex(/^\d+$/, "teamId doit être un entier sous forme de string"), z.number()]).optional(),
});
module.exports = {
    employeeSchema,
};