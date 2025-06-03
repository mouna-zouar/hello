const { PrismaClient } = require('@prisma/client');
const {getProjectById} = require('../services/projectService')
const {getUserById} = require('../services/userService')
const simpleGit = require('simple-git');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

const hasEditAccess = async (pageId, userId) => {
  const access = await prisma.PageAccess.findFirst({
    where: { pageId, userId, role: { in: ['editor', 'admin'] } },
  });
  return !!access;
};

const createPage = async (req, res) => {
  const { title, content, projectId, userId } = req.body;
  try {
    const project = await getProjectById(projectId);
    const user = await getUserById(userId);

    if (!project) return res.status(404).json({ error: 'Projet introuvable' });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const page = await prisma.page.create({
      data: { title, content, projectId, userId },
    });

    await prisma.pageVersion.create({
      data: {
        content,
        pageId: page.id,
        createdBy: userId,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la page' });
  }
};

const updatePage = async (req, res) => {
  const { id } = req.params;
  const { content, userId } = req.body;

  try {
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const canEdit = await hasEditAccess(id, userId);
    if (!canEdit) return res.status(403).json({ error: 'Accès refusé' });

    const page = await prisma.page.update({
      where: { id },
      data: { content },
    });

    await prisma.pageVersion.create({
      data: {
        content,
        pageId: id,
        createdBy: userId,
      },
    });

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la page' });
  }
};

const getPageVersions = async (req, res) => {
  const { id } = req.params;
  try {
    const versions = await prisma.PageVersion.findMany({
      where: { pageId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(versions);
  } catch (error) {
    console.error(error);  // ← Ça va afficher l'erreur complète dans la console
    res.status(500).json({ error: 'Erreur lors de la récupération des versions' });
  }
};


const sharePage = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.body;

  try {
    const shared = await prisma.PageAccess.create({
      data: {
        pageId: parseInt(id), // 🔧 Ajoute parseInt si id est une chaîne
        userId: parseInt(userId),
        role, 
      },
    });
    res.json({ message: 'Page partagée avec succès', shared });
  } catch (error) {
    console.error(error); // 👈 Ajoute ceci
    res.status(500).json({ error: 'Erreur lors du partage de la page' });
  }
};


const searchPages = async (req, res) => {
  const { q } = req.query;
  try {
    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
};

const pushToGit = async (req, res) => {
  const id = parseInt(req.params.id);
  const { userId, remoteUrl } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ error: "L'id doit être un nombre valide" });
    }

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return res.status(404).json({ error: 'Page non trouvée' });

    const canEdit = await hasEditAccess(id, userId);
    if (!canEdit) return res.status(403).json({ error: 'Accès refusé' });

    if (!remoteUrl) {
      return res.status(400).json({ error: "L'URL du remote est requise" });
    }

    const repoPath = path.resolve(__dirname, '../git-repos', String(id));
    await fs.mkdir(repoPath, { recursive: true });

    const git = simpleGit(repoPath);

    const safeTitle = page.title.replace(/[^\w\-]/g, '_');
    const filePath = path.join(repoPath, `${safeTitle}.md`);
    await fs.writeFile(filePath, page.content);

    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      // Création de la branche dev
      await git.checkoutLocalBranch('dev');
    } else {
      // Sinon, basculer sur la branche dev (ou la créer si elle n'existe pas)
      const branches = await git.branchLocal();
      if (!branches.all.includes('dev')) {
        await git.checkoutLocalBranch('dev');
      } else {
        await git.checkout('dev');
      }
    }

    const remotes = await git.getRemotes(true);
    const originRemote = remotes.find(r => r.name === 'origin');
    if (!originRemote) {
      await git.addRemote('origin', remoteUrl);
    } else if (originRemote.refs.fetch !== remoteUrl) {
      await git.remote(['set-url', 'origin', remoteUrl]);
    }

    await git.add('.');
    await git.commit(`Mise à jour de la page ${page.title}`);

    // Pousser sur la branche dev
    await git.push('origin', 'dev');

    res.json({ message: 'Push Git réussi sur la branche dev pour la page' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur push vers Git' });
  }
};





module.exports = {
  createPage,
  updatePage,
  getPageVersions,
  sharePage,
  searchPages,
  pushToGit,
  hasEditAccess
};
