let BASE_URL ="";
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_BASE_URL") {
    BASE_URL = event.data.baseUrl;
  }
});

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = JSON.parse(event.data.text());

    const jsonData = JSON.parse(data);

    const title = jsonData.title ? jsonData.title.replace(/<[^>]*>/g, "") : "";
    const body = jsonData.body ? jsonData.body.replace(/<[^>]*>/g, "") : "";

    self.registration
      .showNotification(title, {
        body: body,
        icon: "/logo.png",
        data: { url: BASE_URL },
      })
      .then(() => {
        console.log("Notification displayed successfully!");
      })
      .catch((err) => {
        console.error("Error displaying notification:", err);
      });
  } else {
    console.log("Push event received, but no data.");
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        const url = BASE_URL;
        return self.clients.openWindow(url);
      })
      .catch((error) => {
        console.error("Error during notification click handling:", error);
      })
  );
});

self.addEventListener("install", (event) => {
  console.log("Service Worker Installing...");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
  event.waitUntil(self.clients.claim());
});
