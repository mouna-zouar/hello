const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController'); 

router.post('/', pageController.createPage);

router.put('/:id', pageController.updatePage);

router.get('/:id/versions', pageController.getPageVersions);

router.post('/:id/share', pageController.sharePage);

router.get('/search', pageController.searchPages);

router.post('/:id/git-push', pageController.pushToGit);

module.exports = router;
