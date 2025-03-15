import express from 'express';
import routers from './routers/index.mjs'
import cors from 'cors'

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:8000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', routers.auth)
app.use('/api', routers.api)

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;