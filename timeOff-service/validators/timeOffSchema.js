const { z } = require('zod');
const { TimeOffType, TimeOffStatus } = require('@prisma/client');

const createTimeOffSchema = z.object({
    employeeId: z.number().int().positive(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "La date de début n'est pas valide",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "La date de fin n'est pas valide",
    }),
    timeOffType: z.enum([TimeOffType.CONGE_PAYE, TimeOffType.CONGE_MALADIE, TimeOffType.CONGE_SANS_SOLDE, TimeOffType.CONGE_PARENTAL]),
});



const updateTimeOffSchema = z.object({
    employeeId: z.number().int().positive(),
    startDate: z.string().optional().refine((val) => !isNaN(Date.parse(val)), {
        message: "La date de début n'est pas valide",
    }),
    endDate: z.string().optional().refine((val) => !isNaN(Date.parse(val)), {
        message: "La date de fin n'est pas valide",
    }),
    timeOffType: z.enum([TimeOffType.CONGE_PAYE, TimeOffType.CONGE_MALADIE, TimeOffType.CONGE_SANS_SOLDE, TimeOffType.CONGE_PARENTAL]),
    status: z.enum([TimeOffStatus.EN_ATTENTE, TimeOffStatus.APPROUVE, TimeOffStatus.REFUSE]).optional(),
});


module.exports = { createTimeOffSchema, updateTimeOffSchema };
