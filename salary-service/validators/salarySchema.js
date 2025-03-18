// validators/salarySchema.js
const { z } = require('zod');

const salarySchema = z.object({
    employeeId: z.number().int().positive(),
    baseSalary: z.number().int().positive().optional(),
});

module.exports = salarySchema;
