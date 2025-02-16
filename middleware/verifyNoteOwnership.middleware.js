import {getNoteById} from "../db/queries.js"
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
        .json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error("Error verifying note ownership:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const verifySwapNoteOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    const uid = user.id;
    const { id1,id2 } = req.body;

    const note1 = await getNoteById(id1);
    const note2 = await getNoteById(id2);
    if (!note1 || !note2) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note1.uid !== uid || note2.uid !== uid) {
      return res
        .status(403)
        .json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error("Error verifying note ownership:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export { verifyNoteOwnership,verifySwapNoteOwnership };
