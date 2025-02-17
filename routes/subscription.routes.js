import {addSubscription, removeSubscription} from "../controllers/subscription.controller.js";
import verifyUser from "../middleware/auth.middleware.js";

import express from "express";

const router = express.Router();

router.post("/add", verifyUser, addSubscription);
router.delete("/remove", verifyUser, removeSubscription);

export default router;