import { changeSetting, getSetting } from "../db/queries.js";

async function getSettingById(req, res) {
  try {
    const user = req.user;
    const sid = user.sid;

    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({
      setting: prevSetting[0],
    });
  } catch (error) {
    console.error("Error getting user setting", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateDarkmode(req, res) {
  try {
    const user = req.user;
    const sid = user.sid;
    const id = user.id;
    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const newDarkmode = !prevSetting[0].darkmode;
    const updatedSetting = await changeSetting(
      sid,
      newDarkmode,
      prevSetting[0].bg,
      prevSetting[0].drag,
      prevSetting[0].notification,
      new Date()
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({
      message: "Dark mode updated successfully",
    });
  } catch (error) {
    console.error("Error updating dark mode:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateBg(req, res) {
  try {
    const user = req.user;
    const sid = user.sid;
    const { bg } = req.body;

    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const updatedSetting = await changeSetting(
      sid,
      prevSetting[0].darkmode,
      bg,
      prevSetting[0].drag,
      prevSetting[0].notification,
      new Date()
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json({
      message: "Background updated successfully",
    });
  } catch (error) {
    console.error("Error updating Background:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateDrag(req, res) {
  try {
    const user = req.user;
    const sid = user.sid;

    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    const drag = !prevSetting[0].drag;

    const updatedSetting = await changeSetting(
      sid,
      prevSetting[0].darkmode,
      prevSetting[0].bg,
      drag,
      prevSetting[0].notification,
      new Date()
    );
    if (!updatedSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json({
      message: "Drag updated successfully",
    });
  } catch (error) {
    console.error("Error updating drag:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateNotification(req, res) {
  try {
    const user = req.user;
    const sid = user.sid;

    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    const notification = !prevSetting[0].notification;
    const updatedSetting = await changeSetting(
      sid,
      prevSetting[0].darkmode,
      prevSetting[0].bg,
      prevSetting[0].drag,
      notification,
      new Date()
    );

    if (!updatedSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json({
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("Error updating Notification", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export {
  updateDarkmode,
  updateBg,
  updateDrag,
  updateNotification,
  getSettingById,
};
