import {
  addNote,
  updateNote,
  sortNote,
  getNotes,
  deleteNote,
  deleteAllNotes,
} from "../db/queries.js";

async function createNote(req, res) {
  try {
    const { title, content, alert, position } = req.body;
    const user = req.user;
    const uid = user.id;
    const sid = user.sid;

    const note = await addNote(uid, sid, title, content, alert, position);

    if (note && note.length > 0) {
      return res.status(200).json({ message: "Note added successfully" });
    } else {
      return res.status(400).json({ message: "Note could not be added" });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function changeNote(req, res) {
  try {
    const { id, title, content, alert, position, star } = req.body;

    const note = await updateNote(id, title, content, alert, position, star);

    if (note && note.length > 0) {
      return res.status(200).json({ message: "Note updated successfully" });
    } else {
      return res.status(400).json({ message: "Note could not be updated" });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function markNote(req, res) {
  try {
    const { id, star } = req.body;

    const note = await updateNote(id, star);

    if (note && note.length > 0) {
      return res.status(200).json({ message: "Note updated successfully" });
    } else {
      return res.status(400).json({ message: "Note could not be updated" });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function changePosition(req, res) {
  try {
    const { id, position } = req.body;

    const note = await updateNote(id, position);

    if (note && note.length > 0) {
      return res
        .status(200)
        .json({ message: "Note position changed successfully" });
    } else {
      return res.status(400).json({ message: "Note could not be updated" });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAllNote(req, res) {
  try {
    const user = req.user;
    const id = user.id;
    const notes = await getNotes(id);

    if (notes && notes.length > 0) {
      return res.status(200).json({ notes });
    } else {
      return res.status(404).json({ message: "No notes found" });
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function sortAllNotes(req, res) {
  try {
    const { type } = req.body;
    const user = req.user;
    const id = user.id;
    const notes = await getNotes(id, type);
    if (notes && notes.length > 0) {
      return res.status(200).json({ notes });
    } else {
      return res.status(404).json({ message: "No notes found to sort" });
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteNoteById(req, res) {
  try {
    const { id } = req.body;
    const note = await deleteNote(id);

    if (note && note.length > 0) {
      return res.status(200).json({ message: "Note deleted successfully" });
    } else {
      return res.status(404).json({ message: "Note not found" });
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deletAllNoteById(req, res) {
  try {
    const user = req.user;
    const uid = user.id;
    const note = await deleteAllNotes(uid);

    if (note && note.length > 0) {
      return res.status(200).json({ message: "All note deleted successfully" });
    } else {
      return res.status(404).json({ message: "All note not found" });
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default {
  createNote,
  changeNote,
  markNote,
  changePosition,
  getAllNote,
  sortAllNotes,
  deleteNoteById,
  deletAllNoteById,
};
