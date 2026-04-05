import { Router } from 'express';
import authController from '../controllers/authController.js';

const userRoutes = Router();

userRoutes.post("/register", authController.createUser);
userRoutes.get("/" , authController.listUsers);

export default userRoutes;
