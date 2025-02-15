import {
  addNote,
  updateNote,
  swapNote,
  sortNote,
  getNotes,
  deleteNote,
  deleteAllNotes,
} from "../db/queries.js";

async function createNote(req, res) {
  try {
    const { title, content, alert } = req.body;
    const user = req.user;
    const uid = user.id;
    const sid = user.sid;

    const prevNotes = await getNotes(uid);
    const noteCount = prevNotes.length;
    const position = noteCount + 1;
    const note = await addNote(uid, sid, title, content, alert, position);

    if (note && note.length > 0) {
      return res
        .status(200)
        .json({ message: "Note added successfully", note: note });
    } else {
      return res.status(400).json({ message: "Note could not be added" });
    }
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateNoteByid(req, res) {
  try {
    const { id, title, content, alert, position } = req.body;
    console.log("body", id, title, content, alert, position);
    const note = await updateNote({ id, title, content, alert, position });
    console.log("note", note);
    console.log("note", note.length);
    console.log("note", note && note.length > 0);

    if (note) {
      return res.status(200).json({ note: note });
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
    console.log("id", id, star);
    const note = await updateNote({ id: id, star: star });
    console.log("note", note);
    if (note) {
      return res.status(200).json({ note: note });
    } else {
      return res.status(400).json({ message: "Note could not be updated" });
    }
  } catch (error) {
    console.error("Error marking  note:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function changePosition(req, res) {
  try {
    const { id1, id2 } = req.body;

    console.log("id1", id1, "id2", id2);
    const {note1 ,note2 }= await swapNote({id1,id2});

    if (note1 && note2) {
      return res
        .status(200)
        .json({ message: "Note position changed successfully" });
    } else {
      return res.status(400).json({ message: "Note could not be changed" });
    }
  } catch (error) {
    console.error("Error changing note position :", error);
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
      return res.status(201).json({ notes: [] });
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
    const notes = await sortNote(id, type);
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

    return res.status(200).json({ message: "Note deleted successfully" });
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

export {
  createNote,
  updateNoteByid,
  markNote,
  changePosition,
  getAllNote,
  sortAllNotes,
  deleteNoteById,
  deletAllNoteById,
};
