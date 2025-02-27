const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inviteUser = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.userId;  // Assure-toi que userId est extrait correctement

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }

        console.log("UserId de l'utilisateur authentifié:", userId);
        console.log("Attempting to invite user with email: ", email);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà associé à un utilisateur" });
        }

        const inviteToken = crypto.randomBytes(20).toString('hex');
        const invitation = await prisma.invitation.create({
            data: {
                email,
                token: inviteToken,
                expiresAt: new Date(Date.now() + 3600000),
                userId: userId,  // Lier correctement l'invitation à l'utilisateur authentifié
            }
        });

        console.log("Invitation created: ", invitation);

        const inviteLink = `http://localhost:3000/invite/${inviteToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Invitation à rejoindre notre application',
            text: `Bonjour, vous avez été invité à rejoindre notre application. Veuillez cliquer sur le lien suivant pour compléter votre inscription : ${inviteLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending error: ", error);
                return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
            }

            console.log("Invitation email sent: ", info);
            res.status(200).json({ message: 'Invitation envoyée avec succès' });
        });
    } catch (error) {
        console.error("Error in inviteUser: ", error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'invitation de l\'utilisateur' });
    }
};


const validateInviteToken = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await prisma.invitation.findUnique({ where: { token } });
        if (!invitation) {
            return res.status(400).json({ error: "Invitation invalide" });
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: "Le lien d'invitation a expiré" });
        }

        res.status(200).json({ message: "Invitation valide", invitation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la validation du token d'invitation" });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { token, password } = req.body;

        const invitation = await prisma.invitation.findUnique({ where: { token } });
        if (!invitation) {
            return res.status(400).json({ error: "Invitation invalide" });
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: "Le lien d'invitation a expiré" });
        }

        const newUser = await prisma.user.create({
            data: {
                email: invitation.email,
                password: password,
            }
        });

        await prisma.invitation.delete({ where: { token } });

        res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de l'acceptation de l'invitation" });
    }
};

module.exports = {
    inviteUser,
    validateInviteToken,
    acceptInvitation,
};
