import { Response, NextFunction } from "express";
import Task from "../models/Task.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, completed } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed must be a boolean",
      });
    }

    const task = await Task.create({
      title,
      description,
      completed,
      userId: req.user?.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter =
      req.user?.role === "admin"
        ? {}
        : { userId: req.user?.userId };

    const tasks = await Task.find(filter);

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      req.user?.role !== "admin" &&
      task.userId.toString() !== req.user?.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, completed } = req.body;

    const allowedFields = ["title", "description", "completed"];
    const fields = Object.keys(req.body);

    const invalidField = fields.some(
      (field) => !allowedFields.includes(field)
    );

    if (invalidField) {
      return res.status(400).json({
        success: false,
        message: "Invalid update fields",
      });
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed must be a boolean",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      req.user?.role !== "admin" &&
      task.userId.toString() !== req.user?.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      req.user?.role !== "admin" &&
      task.userId.toString() !== req.user?.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};