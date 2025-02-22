import verifyUser from "../middleware/auth.middleware.js";
import { verifyNoteOwnership,verifySwapNoteOwnership} from "../middleware/verifyNoteOwnership.middleware.js";
import express from "express";

const router = express.Router();

import {
  createNote,
  updateNoteByid,
  markNote,
  changePosition,
  getAllNote,
  deleteNoteById,
  deletAllNoteById,
} from "../controllers/note.controller.js";

router.get("/all", verifyUser, getAllNote);
router.post("/add", verifyUser, createNote);
router.put("/update", verifyUser, verifyNoteOwnership, updateNoteByid);
router.put("/mark", verifyUser, verifyNoteOwnership, markNote);
router.put("/position", verifyUser,verifySwapNoteOwnership, changePosition);
router.delete("/delete", verifyUser, verifyNoteOwnership, deleteNoteById);
router.delete("/delete/all", verifyUser, verifyNoteOwnership, deletAllNoteById);

export default router;
