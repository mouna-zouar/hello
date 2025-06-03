const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {getUserById,getAllUsers} = require('../services/userService')



exports.sendMessage = async (req, res) => {
  try {
    const { content, senderId, receiverId } = req.body;

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: receiverId || null,
      },
    });

    let userIdsToNotify = [];

    if (receiverId) {
      if (receiverId !== senderId) userIdsToNotify.push(receiverId);
    } else {

      const allUsers = await getAllUsers(); 
      userIdsToNotify = allUsers
        .filter(user => user.id !== senderId)
        .map(user => user.id);
    }

    const notificationsData = [];

    for (const userId of userIdsToNotify) {
      const user = await getUserById(userId);
      if (user) {
        notificationsData.push({
          userId,
          title: '💬 Nouveau message',
          message: `Nouveau message de ${user.username || userId}: ${content.slice(0, 50)}...`,
          type: 'chat',
          read: false,
        });
      }
    }

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur envoi message' });
  }
};


exports.getDirectMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(user1), receiverId: parseInt(user2) },
          { senderId: parseInt(user2), receiverId: parseInt(user1) },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération messages directs' });
  }
};

exports.getGlobalMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { receiverId: null },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération messages globaux' });
  }
};
