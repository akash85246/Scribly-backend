import { addUserSubscription, removeUserSubscription } from "../db/queries.js";

async function addSubscription(req, res) {
  try {
    const { subscription } = req.body;
    const user = req.user;
   const uid = user.id;
    const { endpoint,keys } = subscription;
    const subs = await addUserSubscription({endpoint,keys, uid });
    if (subs) {
      return res.status(200).json({
        message: "Subscription added successfully"
      });
    } else {
      return res
        .status(400)
        .json({ message: "Subscription could not be added" });
    }
  } catch (error) {
    console.error("Error adding subscription:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function removeSubscription(req, res) {
  try {
    const user = req.user;
   const uid = user.id;
    const subscription = await removeUserSubscription({uid});
    console.log("Subscription:", subscription);
    if (subscription) {
      console.log("Subscription removed successfully");
      return res.status(200).json({
        message: "Subscription removed successfully",
        subscription: subscription,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Subscription could not be removed" });
    }
  } catch (error) {
    console.error("Error removing subscription:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export { addSubscription, removeSubscription };
