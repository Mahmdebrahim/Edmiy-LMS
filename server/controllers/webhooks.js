import { Webhook } from "svix";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";


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

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  switch (event.type) {
    // ✅ الدفع نجح
    case "checkout.session.completed": {
      console.log("✅ checkout.session.completed received");
      const session = event.data.object; // ← مباشرة من الـ event
      console.log("metadata:", session.metadata); // ← شوف فيه purchaseId ولا لأ
      const { purchaseId } = session.metadata;
       console.log("purchaseId:", purchaseId);


      const purchaseData = await Purchase.findById(purchaseId);
      console.log("purchaseData:", purchaseData); // ← شوف لقاه ولا لأ
      
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(
        purchaseData.courseId.toString(),
      );

      courseData.enrolledStudents.push(userData);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();
      break;
    }

    // ✅ الدفع فشل
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const { purchaseId } = sessions.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ success: true });
};
