import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import waterRoutes from './routes/water';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);

export default app;
