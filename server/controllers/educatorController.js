import { clerkClient } from "@clerk/express";

// update role to educator
const updateRoleToEductor = async (req, res) => {
  const userId = req.auth.userId;
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.status(200).json({ message: "Role updated to educator successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update role", error: error.message });
  }
};

export { updateRoleToEductor };
