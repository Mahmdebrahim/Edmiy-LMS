import { clerkClient } from "@clerk/express";

const protectEducator = async (req, res, next) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthoooorized" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.role !== "educator") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Educator role required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

export default protectEducator;
