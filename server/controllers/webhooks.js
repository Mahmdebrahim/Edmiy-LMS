import { Webhook } from "svix";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Stripe from "stripe";
import Course from "../models/Course.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const payload = req.body;
    const headers = req.headers;

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

  const rawBody =
    req.body instanceof Buffer
      ? req.body
      : Buffer.from(JSON.stringify(req.body));

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      rawBody, 
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook Error:", err.message);
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { purchaseId, purchaseIds, cartId, couponId, couponIds } =
        session.metadata;
      console.log("couponId from metadata:", couponId);
      // Single course
      if (purchaseId) {
        const purchaseData = await Purchase.findById(purchaseId);
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

        // Increment coupon usage
        if (couponId && couponId !== "") {
          await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
        }
      }

      // Cart
      if (purchaseIds) {
        const ids = purchaseIds.split(",");
        const couponIdsList = couponIds ? couponIds.split(",") : [];

        await Promise.all(
          ids.map(async (id, index) => {
            const purchaseData = await Purchase.findById(id);
            if (!purchaseData) return;

            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(
              purchaseData.courseId.toString(),
            );

            if (!userData.enrolledCourses.includes(courseData._id)) {
              userData.enrolledCourses.push(courseData._id);
              await userData.save();
            }
            if (!courseData.enrolledStudents.includes(userData._id)) {
              courseData.enrolledStudents.push(userData._id);
              await courseData.save();
            }

            purchaseData.status = "completed";
            await purchaseData.save();

            // Increment coupon usage for each course
            const cId = couponIdsList[index];
            if (cId) {
              await Coupon.findByIdAndUpdate(cId, { $inc: { usedCount: 1 } });
            }
          }),
        );

        if (cartId) await Cart.findByIdAndDelete(cartId);
      }

      break;
    }

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
