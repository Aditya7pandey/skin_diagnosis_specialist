import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import consultationRoutes from './routes/consultation.routes'
import { UPLOADS_DIR } from './lib/uploads'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`app is running in ${PORT}`);
})
