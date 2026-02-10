const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Address = require("../models/Address");

router.post("/add", verifyToken, async (req, res) => {
  const user = req.user;
  if (user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can add address" });
  }
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  if (!full_name || !phone || !address_line1 || !city || !state || !postal_code || !country) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const newAddress = new Address({
      user_id: user.id,
      full_name,
      phone,
      address_line1,
      address_line2: address_line2 || "",
      city,
      state,
      postal_code,
      country,
    });

    const savedAddress = await newAddress.save();

    res.status(201).json({
      message: "Address added successfully",
      addressId: savedAddress.id,
      data: {
        user_id: user.id,
        ...req.body,
        address_line2: address_line2 || ""
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 READ: Get All Addresses for Logged-in User (GET /address)
router.get("/", verifyToken, async (req, res) => {
  const user = req.user;
  try {
    const addresses = await Address.find({ user_id: user.id });
    res.status(200).json({ addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ UPDATE: Update an Address (PUT /address/:id)
router.put("/:id", verifyToken, async (req, res) => {
  const user = req.user;
  const addressId = req.params.id;
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
  } = req.body;

  if (!full_name || !phone || !address_line1 || !city || !state || !postal_code || !country) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  try {
    const address = await Address.findOne({ _id: addressId, user_id: user.id });
    if (!address) {
      return res.status(404).json({ message: "Address not found or unauthorized" });
    }

    address.full_name = full_name;
    address.phone = phone;
    address.address_line1 = address_line1;
    address.address_line2 = address_line2 || "";
    address.city = city;
    address.state = state;
    address.postal_code = postal_code;
    address.country = country;

    await address.save();
    res.status(200).json({ message: "Address updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ DELETE: Delete an Address (DELETE /address/:id)
router.delete("/:id", verifyToken, async (req, res) => {
  const user = req.user;
  const addressId = req.params.id;

  try {
    const result = await Address.findOneAndDelete({ _id: addressId, user_id: user.id });
    if (!result) {
      return res.status(404).json({ message: "Address not found or unauthorized" });
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
