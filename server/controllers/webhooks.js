import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const payload = JSON.stringify(req.body);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    whook.verify(payload, headers);

    const { data, type } = req.body;
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        res.json({ received: true });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("🔹 Stripe Signature:", sig);
  console.log("🔹 Type of req.body:", typeof req.body);
  console.log("🔹 req.body:", req.body);
  console.log(
    "🔹 STRIPE_WEBHOOK_SECRET from env:",
    process.env.STRIPE_WEBHOOK_SECRET
  );

  let event;
  try {
    const rawBody = req.body;
    event = stripeInstance.webhooks.constructEvent(
      rawBody, // Use raw body for verification
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" });
  }

  console.log("✅ Received event:", event.type);

  if (event.type === "payment_intent.succeeded") {
    try {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      console.log("💰 Payment Intent ID:", paymentIntentId);

      // Fetch the Checkout Session correctly using Payment Intent ID
      const sessions = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!sessions.data.length) {
        console.error(
          "⚠️ No checkout session found for payment intent:",
          paymentIntentId
        );
        return res.status(400).json({ error: "No session found" });
      }

      const session = sessions.data[0];
      const purchaseId = session.metadata?.purchaseId; // Use optional chaining to avoid errors

      if (!purchaseId) {
        console.error("⚠️ purchaseId is missing in metadata");
        return res.status(400).json({ error: "purchaseId missing" });
      }

      console.log("✅ Purchase ID:", purchaseId);

      // Convert string ID to MongoDB ObjectId (if needed)
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.error(`⚠️ No purchase found with ID: ${purchaseId}`);
        return res.status(404).json({ error: "Purchase not found" });
      }

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(
        purchaseData.courseId.toString()
      );

      if (!userData || !courseData) {
        console.error("⚠️ User or Course not found");
        return res.status(404).json({ error: "User or Course not found" });
      }

      // Update the course and user enrollment
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      // Update purchase status
      purchaseData.status = "completed";
      await purchaseData.save();

      console.log(`✅ Purchase ${purchaseId} marked as completed`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("❌ Error processing payment_intent.succeeded:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    console.log(`⚠️ Unhandled event type: ${event.type}`);
    res.status(200).send("Event received");
  }
};
