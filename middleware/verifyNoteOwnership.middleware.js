import {getNoteById} from "../db/queries"
const verifyNoteOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    const uid = user.id;
    const { id } = req.body;

    const note = await getNoteById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.uid !== uid) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can't delete this note" });
    }
    next();
  } catch (error) {
    console.error("Error verifying note ownership:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verifyNoteOwnership;
