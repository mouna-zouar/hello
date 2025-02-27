const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require("../validators/userValidator");
require("dotenv").config();

const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        validatedData.password = await bcrypt.hash(validatedData.password, 10);
        const user = await prisma.user.create({
            data: validatedData
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", user });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || "Erreur lors de l'inscription" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.roleId },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { id: user.id, role: user.roleId },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        const userAgent = req.get('User-Agent') || "Unknown User-Agent";

        console.log("User-Agent: ", userAgent);

        await prisma.sessionLog.create({
            data: {
                userId: user.id,
                userAgent: userAgent,
                ipAddress: req.ip
            }
        });

        res.json({ message: "Connexion réussie", accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || "Erreur lors de la connexion" });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const offset = (pageNumber - 1) * limitNumber;

        const users = await prisma.user.findMany({
            skip: offset,
            take: limitNumber,
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
            }
        });

        const totalUsers = await prisma.user.count();

        const totalPages = Math.ceil(totalUsers / limitNumber);

        res.json({
            data: users,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalUsers: totalUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        return res.status(500).json({ error: "Une erreur est survenue" });
    }
};

const searchUserByFirstName = async (req, res) => {
    try {
        const { firstName } = req.query;

        if (!firstName) {
            return res.status(400).json({ error: "Le prénom est requis pour la recherche" });
        }

        const users = await prisma.user.findMany({
            where: { firstName },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
            }
        });

        if (users.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé" });
        }

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        await prisma.user.delete({ where: { id } });
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getUserSessions = async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await prisma.sessionLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    searchUserByFirstName,
    deleteUser,
    getUserSessions
};
