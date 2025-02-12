import verifyUser from "../middleware/auth.middleware.js";
import verifyNoteOwnership from "../middleware/verifyNoteOwnership.middleware.js";
import express from "express";

const router = express.Router();

import {
  createNote,
  changeNote,
  markNote,
  changePosition,
  getAllNote,
  sortAllNotes,
  deleteNoteById,
  deletAllNoteById,
} from "../controllers/note.controller.js";

router.get("/notes", verifyUser, verifyNoteOwnership, getAllNote);
router.get("/sort", verifyUser, verifyNoteOwnership, sortAllNotes);
router.post("/add", verifyUser, createNote);
router.put("/update", verifyUser, verifyNoteOwnership, changeNote);
router.put("/mark", verifyUser, verifyNoteOwnership, markNote);
router.put("/position", verifyUser, verifyNoteOwnership, changePosition);
router.delete("/delete", verifyUser, verifyNoteOwnership, deleteNoteById);
router.delete("/delete/all", verifyUser, verifyNoteOwnership, deletAllNoteById);

export default router;
