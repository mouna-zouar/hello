const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔔 Créer une notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la notification.' });
  }
};

// 📬 Récupérer les notifications d’un utilisateur
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications.' });
  }
};

// ✅ Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

// ❌ Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Notification supprimée.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};
exports.markAllAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.notification.updateMany({
      where: { userId: parseInt(userId), read: false },
      data: { read: true },
    });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};
exports.countUnreadNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await prisma.notification.count({
      where: { userId: parseInt(userId), read: false },
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du comptage des notifications.' });
  }
};
