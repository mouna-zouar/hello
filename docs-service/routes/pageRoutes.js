const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController'); 

router.post('/', pageController.createPage);

router.put('/:id', pageController.updatePage);

router.get('/:id/versions', pageController.getPageVersions);

router.post('/:id/share', pageController.sharePage);

router.get('/search', pageController.searchPages);

router.post('/:id/git-push', pageController.pushToGit);
router.get('/page/:id', pageController.getPageById);
router.get('/project/:projectId/pages', pageController.getPagesByProjectId);
router.delete('/:id', pageController.deletePage);
router.post('/:id/git-unlink', pageController.unlinkFromGit);


module.exports = router;
