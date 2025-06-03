const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllColumns = async (req, res) => {
    const { projectId } = req.query
    try {
        const columns = await prisma.column.findMany({
            where: projectId ? { projectId: parseInt(projectId) } : {},
        })
        res.json(columns)
    } catch (error) {
        console.error('Erreur getAllColumns:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

const getColumnByStatus = async (req, res) => {
    const { status } = req.params
    const { projectId } = req.query

    try {
        const column = await prisma.column.findFirst({
            where: {
                status,
                ...(projectId ? { projectId: parseInt(projectId) } : {}),
            },
        })
        if (!column) return res.status(404).json({ message: 'Colonne non trouvée' })
        res.json(column)
    } catch (error) {
        console.error('Erreur getColumnByStatus:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

const updateColumnLimit = async (req, res) => {
    const { status } = req.params
    const { limit, projectId } = req.body

    if (!Number.isInteger(limit) || limit < 1 || !projectId) {
        return res.status(400).json({ message: 'Limite ou projet invalide' })
    }

    try {
        const column = await prisma.column.updateMany({
            where: { status, projectId: parseInt(projectId) },
            data: { limit },
        })

        if (column.count === 0) {
            return res.status(404).json({ message: 'Colonne non trouvée pour ce projet' })
        }

        res.json({ message: 'Limite mise à jour', updated: column.count })
    } catch (error) {
        console.error('Erreur updateColumnLimit:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}
const createDefaultColumns = async (req, res) => {
    const { projectId } = req.body

    if (!projectId) {
        return res.status(400).json({ message: 'projectId requis' })
    }

    try {
        const defaultColumns = [
            { name: 'À faire', status: 'TO_DO', limit: 1, projectId },
            { name: 'En cours', status: 'IN_PROGRESS', limit: 2, projectId },
            { name: 'Terminé', status: 'DONE', limit: 10, projectId },
        ]

        await prisma.column.createMany({ data: defaultColumns })

        res.status(201).json({ message: 'Colonnes par défaut créées' })
    } catch (error) {
        console.error('Erreur createDefaultColumns:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}


module.exports = {
    getAllColumns,
    getColumnByStatus,
    updateColumnLimit,
    createDefaultColumns
}
