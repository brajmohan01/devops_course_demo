import mongoose from 'mongoose';
import Task from '../models/Task.js';

const memoryTasks = [];

const useMongo = () => Boolean(process.env.MONGO_URI && mongoose.connection.readyState === 1);

const normalizeTask = (task) => ({
  _id: task._id || task.id,
  title: task.title,
  description: task.description,
  createdAt: task.createdAt || new Date().toISOString(),
});

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    if (!useMongo()) {
      return res.status(200).json({
        success: true,
        count: memoryTasks.length,
        data: memoryTasks.slice().reverse(),
      });
    }

    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    if (!useMongo()) {
      const task = {
        id: `${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      memoryTasks.unshift(task);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create task',
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!useMongo()) {
      const index = memoryTasks.findIndex((task) => task.id === id || task._id === id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      memoryTasks.splice(index, 1);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
    });
  }
};

export { getAllTasks, createTask, deleteTask };
