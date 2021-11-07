const { Router } = require('express');

const router = Router();

router.get('/messages', async (req, res) => {
  const { manager } = req.services;
  const messages = await manager.readAllMessages();
  res.status(200).send(messages);
});

router.post('/messages', async (req, res) => {
  const { manager } = req.services;
  const { body, writeConcern } = req.body;

  // TODO add model validation using schema at middleware level
  if (Number.isInteger(writeConcern) && writeConcern < 1) {
    res.status(400).send({ error: 'writeConcern must be bigger then 0' });
    return;
  }

  try {
    const id = await manager.appendMessage({ body, writeConcern });
    res.status(200).send({ id });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
