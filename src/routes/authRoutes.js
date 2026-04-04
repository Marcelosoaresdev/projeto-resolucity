import { Router } from 'express';
import authController from '../controllers/authController.js';

const userRoutes = Router();

userRoutes.post("/register", authController.createUser);

// Rota de teste — confirma que o servidor está respondendo
userRoutes.get('/ping', (req, res) => {
  res.json({ message: 'auth ok' });
});

export default userRoutes;
