const { z } = require('zod');

const taskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  priority: z.string().min(1, 'La priorité est requise').optional(),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE'], 'Le statut est invalide'),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(100, 'La progression doit être entre 0 et 100').optional(),
  projectId: z.number().int('L\'ID du projet doit être un nombre entier').optional(),
backlogId: z.number().nullable().optional(),
sprintId: z.number().nullable().optional(),

  parentId: z.number().optional().nullable(),
  assignedTo: z.number().int('L\'ID de l\'employé assigné doit être un nombre entier').nullable().optional()
});


module.exports = { taskSchema };
