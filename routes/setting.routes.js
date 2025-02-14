import verifyUser from "../middleware/auth.middleware.js";
import express from "express";

import {
  updateDarkmode,
  updateBg,
  updateDrag,
  updateNotification,
  getSettingById,
} from "../controllers/setting.controller.js";

const router = express.Router();

router.get("/", verifyUser, getSettingById);
router.put("/darkmode", verifyUser, updateDarkmode);
router.put("/bg", verifyUser, updateBg);
router.put("/drag", verifyUser, updateDrag);
router.put("/notification", verifyUser, updateNotification);

export default router;
