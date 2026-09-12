import { Router } from "express";
import {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { uploadProfilePicture } from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.patch("/me", authMiddleware, updateMe);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);

router.get("/:id", authMiddleware, getUserById);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteUser
);
router.post(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;