import cors from 'cors';
import express from 'express';

import { mongo } from './db/mongo';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import usersRoutes from './routes/users';

const apiVersion = `/api/v1`;

const app = express();
app.use(cors());
app.use(
  express.json({
    limit: '50mb',
  })
);

// // Serve static files from the 'public' directory
// app.use('/public', express.static('public'));

// routes
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/chat`, chatRoutes);
app.use(`${apiVersion}/users`, usersRoutes);

app.use(`${apiVersion}/ping`, (req, res) => {
  res.status(200).json({ message: 'Ping OK' });
});

// connect to DB
mongo.connect().then(() => app.listen(process.env.PORT));
