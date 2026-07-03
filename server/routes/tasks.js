import express from 'express';
import { getAllTasks, createTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/', getAllTasks);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;
