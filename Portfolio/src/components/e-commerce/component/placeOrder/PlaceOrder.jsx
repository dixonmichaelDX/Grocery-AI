import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import NavBars from "../NavBars";

const PlaceOrder = () => {
  const { state } = useLocation();
  const cartItems = state?.cartItems || [];

  const [addresses, setAddresses] = useState([]);
  const [newAddresses, setNewAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Add new address form
  const [openAddr, setOpenAddr] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [states, setStates] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("");

  // Edit address
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const baseUrl = "https://grocery-ai.onrender.com";

  const newAddress = {
    full_name: name,
    phone,
    address_line1: addr1,
    address_line2: addr2,
    city,
    state: states,
    postal_code: postal,
    country,
  };

  useEffect(() => {
    if (!token) {
      navigate("/grocery/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/address`, {
          headers: { Authorization: token },
        });
        setAddresses(response.data.addresses || []);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    fetchAddresses();
  }, [token, newAddresses, navigate]);

  const calculateSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 238 : 0; // to match your template example
  const tax = 0;
  const total = subtotal + shipping + tax;

  const addAddresses = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/address/add`,
        newAddress,
        { headers: { Authorization: token } },
      );
      setNewAddresses(response.data.addresses);

      // Clear add form
      setName("");
      setPhone("");
      setAddr1("");
      setAddr2("");
      setCity("");
      setStates("");
      setPostal("");
      setCountry("");
      setOpenAddr(false);
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const handleNewAddress = (e) => {
    e.preventDefault();
    addAddresses();
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`${baseUrl}/api/address/${id}`, {
        headers: { Authorization: token },
      });
      setAddresses(addresses.filter((addr) => addr.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete(`${baseUrl}/api/cart/clear`, {
        headers: { Authorization: token },
      });
      console.log("Cart cleared");
    } catch (err) {
      console.error("Cart clear failed", err);
    }
  };

  const handleEditAddress = (addr) => {
    setEditId(addr.id);
    setEditForm({ ...addr });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${baseUrl}/api/address/${editId}`, editForm, {
        headers: { Authorization: token },
      });
      setEditId(null);
      setEditForm({});
      const res = await axios.get(`${baseUrl}/api/address`, {
        headers: { Authorization: token },
      });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select an address before placing the order.");
      return;
    }

    const orderPayload = {
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_price: subtotal,
      address_id: selectedAddressId,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/order/add`,
        orderPayload,
        { headers: { Authorization: token } },
      );

      if (response.data.message === "Order placed successfully") {
        await handleClearCart();
        navigate(`/grocery/home/order-confirmation/${response.data.orderId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order");
    }
  };

  if (!cartItems.length) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4 text-gray-900">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            No items found in cart.
          </h2>
          <button
            onClick={() => navigate("/grocery/home")}
            className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <NavBars />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Shipping Address */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Select Shipping Address
                </h3>

                {/* Existing Addresses */}
                <div id="addressList" className="space-y-4 mb-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-500"
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editId === addr.id ? (
                            <form
                              onSubmit={handleUpdateSubmit}
                              className="space-y-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Full Name */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Full Name
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.full_name || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        full_name: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter full name"
                                  />
                                </div>

                                {/* Phone */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Phone Number
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.phone || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter phone number"
                                  />
                                </div>

                                {/* Address Line 1 */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Address Line 1
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.address_line1 || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        address_line1: e.target.value,
                                      }))
                                    }
                                    placeholder="House / Street / Area"
                                  />
                                </div>

                                {/* Address Line 2 */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Address Line 2 (optional)
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.address_line2 || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        address_line2: e.target.value,
                                      }))
                                    }
                                    placeholder="Landmark / Apartment (optional)"
                                  />
                                </div>

                                {/* City */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    City
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.city || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        city: e.target.value,
                                      }))
                                    }
                                    placeholder="City"
                                  />
                                </div>

                                {/* State */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    State
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.state || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        state: e.target.value,
                                      }))
                                    }
                                    placeholder="State"
                                  />
                                </div>

                                {/* PIN Code */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    PIN Code
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.postal_code || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        postal_code: e.target.value,
                                      }))
                                    }
                                    placeholder="560092"
                                  />
                                </div>

                                {/* Country */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Country
                                  </label>
                                  <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                                    value={editForm.country || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        country: e.target.value,
                                      }))
                                    }
                                    placeholder="India"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 mt-2">
                                <button
                                  type="submit"
                                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditId(null);
                                  }}
                                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 text-sm font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center mb-2">
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="mr-3 w-4 h-4 text-blue-600"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="font-semibold text-gray-800">
                                  {addr.full_name || "Name not provided"}
                                </span>
                              </div>
                              <p className="text-gray-600 ml-7 text-sm space-y-1">
                                <span className="block font-medium">
                                  Name: {addr.full_name}
                                </span>
                                <span className="block">
                                  Phone: {addr.phone}
                                </span>
                                <span className="block">
                                  Address: {addr.address_line1}
                                  {addr.address_line2
                                    ? `, ${addr.address_line2}`
                                    : ""}
                                </span>
                                <span className="block">
                                  City / State: {addr.city}, {addr.state}
                                </span>
                                <span className="block">
                                  Country / PIN: {addr.country},{" "}
                                  {addr.postal_code}
                                </span>
                              </p>
                            </>
                          )}
                        </div>

                        {editId !== addr.id && (
                          <div
                            className="flex gap-2 ml-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Address Button */}
                <button
                  onClick={() => setOpenAddr((prev) => !prev)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-blue-600 font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  + Add a New Address
                </button>

                {/* Add Address Form */}
                {openAddr && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                      Add New Address
                    </h4>
                    <form onSubmit={handleNewAddress} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            required
                            value={addr1}
                            onChange={(e) => setAddr1(e.target.value)}
                            placeholder="House / Street / Area"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={addr2}
                            onChange={(e) => setAddr2(e.target.value)}
                            placeholder="Landmark, Apartment, etc (optional)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            required
                            value={states}
                            onChange={(e) => setStates(e.target.value)}
                            placeholder="State"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PIN Code
                          </label>
                          <input
                            type="text"
                            required
                            pattern="[0-9]{6}"
                            value={postal}
                            onChange={(e) => setPostal(e.target.value)}
                            placeholder="560092"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all font-semibold"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenAddr(false)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Cart Summary
                </h3>

                <div className="space-y-3 mb-4 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({cartItems.length} items)
                    </span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">₹{shipping}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-800">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{total}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  Place Order
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>🔒 Secure checkout</p>
                  <p className="mt-1">Cash on Delivery available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrder;
