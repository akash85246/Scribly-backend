import sendPushNotification from "../service/web-pushService.js";
import { getAlertNotes } from "../db/queries.js";

const sendNotifications = async () => {
  try {
    const alertNotes = await getAlertNotes();

    if (!alertNotes || alertNotes.length === 0) {
      return;
    }

    for (const note of alertNotes) {
      const payload = JSON.stringify({
        title: note.title_markdown,
        body: note.content_markdown,
      });

      try {
        sendPushNotification(
          { endpoint: note.endpoint, keys: note.keys },
          payload
        );
      } catch (err) {
        console.error("Error sending notification", err);
      }
    }
  } catch (err) {
    console.error("Error fetching alert notes", err);
  }
};

export default sendNotifications;
