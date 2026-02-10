const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users
router.get("/", async (req, res) => {
    try {
        // Fetch all users, excluding the password field for security
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server Error: Unable to fetch users" });
    }
});

module.exports = router;
