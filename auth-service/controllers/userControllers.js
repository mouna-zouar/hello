const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const produceEvent = require("../kafka/kafkaProducer");
const { registerSchema, loginSchema } = require("../validators/userValidator");
const EVENTS = require('../constants/events');
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

        try {
            await produceEvent(EVENTS.USER_CREATED, {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                password:user.password,
                photo:user.photo,
                gender :user.gender,
                status :user.status,
                roleId:user.roleId,
                departmentId:user.departmentId,
            });
            console.log('Événement Kafka produit avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'événement Kafka:', error);
            return res.status(500).json({ error: 'Erreur interne de production d\'événement' });
        }

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

/*const getUserById = async (req, res) => {
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
                lastName: true,
                password:true,
                photo:true,
                gender :true,
                status :true,
                roleId:true,
                departmentId:true,
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
*/

const getUserById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return { exists: false };
        }

        return {
            exists: true,
            id: user.id,
            email: user.email,
            username: user.username,
            firstname: user.firstname,
            lastname:user.lastname,
            roleId:user.roleId,
            departmentId:user.departmentId,
        };
    } catch (error) {
        console.error("Erreur dans findUserById:", error);
        return { error: "Erreur interne" };
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

const verifyTokenAndPermissions = async (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: "Token manquant" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

        const permissions = user.role.permissions.map(rp => ({
            model: rp.permission.model,
            operation: rp.permission.operation
        }));

        return res.json({
            id: user.id,
            role: user.role.role,
            permissions
        });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Token invalide" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, username, firstName, lastName, password, photo, gender, status, roleId, departmentId,} = req.body;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (email) {
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: parseInt(id) }
                }
            });
            if (existingEmail) {
                return res.status(400).json({ error: "Cet email est déjà utilisé par un autre utilisateur." });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                email,
                username,
                firstName,
                lastName,
                password,
                photo,
                gender,
                status,
                roleId,
                departmentId,
            }
        });

        await produceEvent(EVENTS.USER_UPDATED, {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            password: updatedUser.password,
            photo: updatedUser.photo,
            gender: updatedUser.gender,
            status:updatedUser.status,
            roleId:updatedUser.roleId,
            departmentId: updatedUser.departmentId,
        });
        res.status(200).json({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    deleteUser,
    getUserSessions,
    updateUser,
    verifyTokenAndPermissions
};
