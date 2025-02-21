import cron from "node-cron";
import sendNotifications from "../controllers/notification.controller.js";


// Runs every day at 10 AM
cron.schedule("0 10 * * *", () => {
  console.log("Running daily notification cron...");
  sendNotifications();
});

console.log("Cron job scheduled for notifications.");
