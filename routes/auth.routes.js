import express from "express";
import { signIn, signOut, userDelete,googleCallback,getJWT,loginUpdate } from "../controllers/auth.controller.js";
import verifyUser from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/signin", signIn);
router.get("/google/callback",googleCallback);
router.get("/signin", getJWT);
router.get("/signout", signOut);

router.put("/updateLogin",verifyUser,loginUpdate);
router.delete("/delete", userDelete);

export default router;