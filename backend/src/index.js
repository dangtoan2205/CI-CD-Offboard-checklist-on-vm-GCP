require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ticketsRouter = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api/tickets', ticketsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
