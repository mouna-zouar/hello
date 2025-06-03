const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const produceEvent = require('../kafka/kafkaProducer');
const EVENTS = require('../constants/events');
const jwt = require('jsonwebtoken');
const inviteUser = async (req, res) => {
  try {
    // On récupère toutes les données utilisateur nécessaires dans le body
    const {
      firstName,
      lastName,
      username,
      email,
      gender,
      password,       // mot de passe en clair reçu ici
      departmentId,
      teamId,
      roleId,
      userId,         // l'ID de l'invitant
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }
    if (!email) {
      return res.status(400).json({ error: "email est requis" });
    }
    if (!password) {
      return res.status(400).json({ error: "password est requis" });
    }

    // Hasher le mot de passe (avec bcrypt)
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Construire le payload JWT (sans le mdp en clair)
    const payload = {
      firstName,
      lastName,
      username,
      email,
      gender,
      departmentId,
      teamId,
      roleId,
      invitedBy: userId,
      hashedPassword,   // stocke le hash, PAS le mdp en clair
    };

    // Générer le token JWT avec expiration 1 heure
    const inviteToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Stocker l'invitation en base (token JWT)
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token: inviteToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 heure
        userId,
      },
    });

    const inviteLink = `http://localhost:5173/invite/${inviteToken}`;

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
      text: `Bonjour,

Vous avez été invité(e) à rejoindre notre application.

Veuillez cliquer sur le lien suivant pour compléter votre inscription (valide 1h) :
${inviteLink}

Si vous n'avez pas demandé cette invitation, ignorez cet email.

Cordialement,
L'équipe`,
    };

    // Envoi du mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur lors de l'envoi de l'email : ", error);
        return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
      }
      console.log("Email d'invitation envoyé : ", info.response);
      res.status(200).json({ message: "Invitation envoyée avec succès" });
    });

  } catch (error) {
    console.error("Erreur dans inviteUser : ", error);
    res.status(500).json({ error: "Erreur serveur lors de l'invitation de l'utilisateur" });
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
        produceEvent(EVENTS.USER_INVITATION_VALIDATED, { token, invitationId: invitation.id });

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

        produceEvent(EVENTS.USER_INVITATION_ACCEPTED, { userId: newUser.id, invitationId: invitation.id });

        res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de l'acceptation de l'invitation" });
    }
};

module.exports = {
    inviteUser,
    validateInviteToken,
    acceptInvitation
};
