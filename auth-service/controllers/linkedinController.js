const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

require("dotenv").config();

const prisma = new PrismaClient();


exports.loginLinkedIn = (req, res) => {
    const linkedinURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress`;
    res.redirect(linkedinURL);
};

exports.callbackLinkedIn = async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post(
            'https://www.linkedin.com/oauth/v2/accessToken',
            null,
            {
                params: {
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
                    client_id: process.env.LINKEDIN_CLIENT_ID,
                    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const linkedInUser = userResponse.data;
        const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const email = emailResponse.data.elements[0]['handle~'].emailAddress;

        // Vérifier si l'utilisateur existe déjà
        let user = await prisma.user.findUnique({ where: { email } });

        // Si l'utilisateur n'existe pas, on le crée
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: `${linkedInUser.firstName.localized.en_US} ${linkedInUser.lastName.localized.en_US}`,
                    provider: 'linkedin',
                },
            });
        }

        // Générer un token JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({
            message: 'Authentification LinkedIn réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        });
    } catch (error) {
        console.error('Erreur LinkedIn:', error.response?.data || error.message);
        res.status(500).send('Erreur OAuth LinkedIn');
    }
};