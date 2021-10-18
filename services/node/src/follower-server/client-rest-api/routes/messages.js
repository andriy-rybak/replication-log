const { Router } = require('express');

const router = Router();

router.get('/messages', async (req, res) => {
  const { manager } = req.services;
  const messages = await manager.readAllMessages();
  res.status(200).send(messages);
});

module.exports = router;
