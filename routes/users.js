const router = require('express').Router();

const { getUsers, getUserId } = require('../controllers/users');

router.get('/', getUsers);

router.get('/:id', getUserId);

module.exports = router;
