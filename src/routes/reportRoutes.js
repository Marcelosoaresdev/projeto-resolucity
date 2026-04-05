import { Router } from 'express';
import reportController from '../controllers/reportController.js';

const reportRoutes = Router();

reportRoutes.post('/', reportController.createReport);
reportRoutes.get('/', reportController.listReports);

export default reportRoutes;
