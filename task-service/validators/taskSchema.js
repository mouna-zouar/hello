const { z } = require('zod');

const taskSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    description: z.string().optional(),
    priority: z.string().min(1, 'La priorité est requise'),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], 'Le statut est invalide'),
    type: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    progress: z.number().min(0).max(100, 'La progression doit être entre 0 et 100').optional(),
    projectId: z.number().int('L\'ID du projet doit être un nombre entier'),
    backlogId: z.number().int('L\'ID du backlog doit être un nombre entier'),
    sprintId: z.number().int('L\'ID du sprint doit être un nombre entier'),
    parentId: z.number().int().optional(),
    assignedTo: z.number().int('L\'ID de l\'employé assigné doit être un nombre entier')
});

module.exports = { taskSchema };
