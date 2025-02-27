const { z } = require("zod");

const registerSchema = z.object({
    username: z.string().min(3),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    gender: z.enum(["male", "female", "other"]),
    roleId: z.number().int().positive(),
    departmentId: z.number().int().positive()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

module.exports = { registerSchema, loginSchema };
