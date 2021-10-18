const { Router } = require('express');

const messages = require('./routes/messages');

const router = Router();

router.use('/api', [
  messages,
]);

module.exports = router;
