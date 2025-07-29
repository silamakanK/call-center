const express = require('express');
const app = express();
const userRouter = require('./routes/users');
const cors = require('cors');
const corsOptions = require('./middleeware/allowedOrigin');

app.use(express.json());
app.use(cors(corsOptions));
app.get('/', (req, res) => {
  res.send('Welcome to the Call Center');
});
app.use('', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`)
});