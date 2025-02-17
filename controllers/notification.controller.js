import sendPushNotification from "../service/web-pushService.js";
import { getAlertNotes } from "../db/queries.js";

const sendNotifications = async () => {
  try {
    // Wait for the database query to complete
    const alertNotes = await getAlertNotes(); 

    if (!alertNotes || alertNotes.length === 0) {
      console.log("No alert notes found.");
      return;
    }

    for (const note of alertNotes) {
      console.log(
        "Alert Note:",
        note.title_markdown,
        note.content_markdown,
        note.alert,
        note.endpoint,
        note.keys
      );

      const payload = JSON.stringify({
        title: note.title_markdown,
        body: note.content_markdown,
      });

      try {
        await sendPushNotification(
          { endpoint: note.endpoint, keys: note.keys },
          payload
        );
        console.log("Notification sent to:", note.endpoint);
      } catch (err) {
        console.error("Error sending notification", err);
      }
    }
  } catch (err) {
    console.error("Error fetching alert notes", err);
  }
};

export default sendNotifications;