import webPush from "web-push";
const VAPID_PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY;

webPush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Function to send push notifications
const sendPushNotification = (subscription, payload) => {
  webPush
    .sendNotification(subscription, JSON.stringify(payload))
    .then(() => console.log("Notification sent successfully"))
    .catch((err) => console.error("Error sending notification:", err));
};

export default sendPushNotification;