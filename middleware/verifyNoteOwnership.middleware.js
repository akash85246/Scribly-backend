import {getNoteById} from "../db/queries.js"
const verifyNoteOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    const uid = user.id;
    const { id } = req.body;

    const note = await getNoteById(id);
    console.log("note",note); 
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.uid !== uid) {
      console.log("note uid",note.uid,"\n uid" ,uid);
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

export default verifyNoteOwnership;
