const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const redirectUri = process.env.SLACK_REDIRECT_URI;
require("dotenv").config();

const prisma = new PrismaClient();

exports.loginSlack = (req, res) => {
    const slackURL = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=identity.basic,identity.email&redirect_uri=${redirectUri}`;
    res.redirect(slackURL);
};


exports.callbackSlack = async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post(
            'https://slack.com/api/oauth.v2.access',
            null,
            {
                params: {
                    client_id: process.env.SLACK_CLIENT_ID,
                    client_secret: process.env.SLACK_CLIENT_SECRET,
                    code: code,
                    redirect_uri: process.env.SLACK_REDIRECT_URI,
                },
            }
        );

        const authedUser = tokenResponse.data.authed_user;
        if (!authedUser || !authedUser.access_token) {
            return res.status(400).json({ error: "Accès refusé : token utilisateur Slack manquant." });
        }

        const accessToken = authedUser.access_token;

        const userResponse = await axios.get('https://slack.com/api/users.identity', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const slackUser = userResponse.data.user;
        const email = slackUser.email || `${slackUser.id}@slack.com`;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: slackUser.name || "Utilisateur Slack",
                    provider: 'slack',
                },
            });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({
            message: 'Authentification Slack réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        });
    } catch (error) {
        console.error('Erreur Slack:', error.response?.data || error.message);
        res.status(500).send('Erreur OAuth Slack');
    }
};
