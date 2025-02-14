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

    const prevSetting = await getSetting(sid);
    if (!prevSetting) {
      return res.status(404).json({ message: "Settings not found" });
    }

    const newDarkmode = !prevSetting.darkmode;

    const updatedSetting = await changeSetting(
      id,
      prevSetting.sid,
      newDarkmode,
      prevSetting.bg,
      prevSetting.drag,
      prevSetting.notification,
      new Date()
    );

    res.status(200).json({
      message: "Dark mode updated successfully",
      darkmode: newDarkmode,
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
      id,
      prevSetting.sid,
      prevSetting.darkmode,
      bg,
      prevSetting.drag,
      prevSetting.notification,
      new Date()
    );

    res.status(200).json({
      message: "Background updated successfully",
      darkmode: newDarkmode,
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
    const drag = !prevSetting.drag;

    const updatedSetting = await changeSetting(
      id,
      prevSetting.sid,
      prevSetting.darkmode,
      prevSetting.bg,
      drag,
      prevSetting.notification,
      new Date()
    );

    res.status(200).json({
      message: "Drag updated successfully",
      darkmode: newDarkmode,
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
    const notification = !prevSetting.notification;

    const updatedSetting = await changeSetting(
      id,
      prevSetting.sid,
      prevSetting.darkmode,
      prevSetting.bg,
      prevSetting.drag,
      notification,
      new Date()
    );

    res.status(200).json({
      message: "Notification updated successfully",
      darkmode: newDarkmode,
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
