import { z } from 'zod';

export const employeeSchema = z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('L\'email doit être valide'),
    salary: z.number().positive('Le salaire doit être un nombre positif'),
});
