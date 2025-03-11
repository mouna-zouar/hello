const checkPermission = (model, operation) => {
    return (req, res, next) => {
        const { userId, permissions } = req;

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }

        const hasPermission = permissions?.some(p =>
            p.model === model && p.operation === operation
        );

        if (!hasPermission) {
            return res.status(403).json({ error: "Accès interdit - Permission insuffisante" });
        }

        next();
    };
};

module.exports = checkPermission;


