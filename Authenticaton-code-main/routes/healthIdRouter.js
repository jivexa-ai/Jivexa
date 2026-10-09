import express from 'express';
import { createHealthId, getMyHealthId, searchHealthId } from '../controller/healthIdController.js';
import authUserMiddlewares from '../middlewares/authuserMiddlewares.js';

const healthIdRouter = express.Router();

healthIdRouter.post('/', authUserMiddlewares, createHealthId);
healthIdRouter.get('/me', authUserMiddlewares, getMyHealthId);
healthIdRouter.get('/search', searchHealthId);
healthIdRouter.get('/:healthId', searchHealthId);

export default healthIdRouter;
