import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ✅ req.body هنا Buffer (raw) — ده اللي Svix محتاجه
    const payload = req.body;
    const headers = req.headers;

    // ✅ بنبعت الـ raw buffer مباشرة من غير JSON.stringify
    const verifiedPayload = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    const { type, data } = verifiedPayload;

    const clerkUserId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() ||
      data.username ||
      (email ? email.split("@")[0] : "User");
    const imageUrl = data.image_url || data.profile_image_url;

    switch (type) {
      case "user.created":
        if (!email) throw new Error("No email provided");

        await User.create({
          _id: clerkUserId, 
          name: fullName,
          email,
          imageUrl,
        });
        break;

      case "user.updated":
        await User.updateOne(
          { _id: clerkUserId },
          { $set: { name: fullName, imageUrl, email } },
        );
        break;

      case "user.deleted":
        await User.deleteOne({ _id: clerkUserId });
        break;

      default:
        console.log(`Unhandled event: ${type}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
