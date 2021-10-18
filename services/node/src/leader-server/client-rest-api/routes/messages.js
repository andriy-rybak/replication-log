const { Router } = require('express');

const router = Router();

router.get('/messages', async (req, res) => {
  const { manager } = req.services;
  const messages = await manager.readAllMessages();
  res.status(200).send(messages);
});

router.post('/messages', async (req, res) => {
  const { manager } = req.services;
  const { body } = req.body;
  const id = await manager.appendMessage(body);
  res.status(200).send({ id });
});

module.exports = router;
