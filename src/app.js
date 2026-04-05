import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/login',        (req, res) => res.sendFile(path.join(__dirname, '../public/views/login.html')));
app.get('/categorias',  (req, res) => res.sendFile(path.join(__dirname, '../public/views/categorias.html')));
app.get('/estatisticas',(req, res) => res.sendFile(path.join(__dirname, '../public/views/estatisticas.html')));
app.get('/contato',     (req, res) => res.sendFile(path.join(__dirname, '../public/views/contato.html')));
app.get('/sobre',       (req, res) => res.sendFile(path.join(__dirname, '../public/views/sobre.html')));
app.get('/relatar',     (req, res) => res.sendFile(path.join(__dirname, '../public/views/relatar.html')));

export default app;
