const { Router } = require('express');

const messages = require('./messages');

const router = Router();

router.use('/api', [
  messages,
]);

module.exports = router;
