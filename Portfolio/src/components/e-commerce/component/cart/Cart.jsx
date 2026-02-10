import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrashAlt,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaMagic,
  FaShoppingBag,
} from "react-icons/fa";
import NavBar from "../NavBar";

const Cart = () => {
  const baseUrl = "https://grocery-ai.onrender.com";
  const token = localStorage.getItem("token");
  const [cartDetails, setCartDetails] = useState([]);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    if (!token) {
      navigate("/grocery/login");
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/api/cart`, {
        headers: {
          Authorization: token,
        },
      });
      setCartDetails(response.data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleBuyNow = () => {
    navigate("/grocery/home/place-order", {
      state: { cartItems: cartDetails },
    });
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity goes below 1, trigger remove instead
      handleRemove(productId);
      return;
    }

    try {
      await axios.put(
        `${baseUrl}/api/cart/update/${productId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${baseUrl}/api/cart/remove/${productId}`, {
        headers: {
          Authorization: token,
        },
      });
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const totalItems = cartDetails.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const subtotal = cartDetails.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0,
  );

  const shipping = subtotal > 0 ? 99 : 0; // example flat shipping
  const tax = subtotal * 0.1; // 10% tax example
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartDetails.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <button
              onClick={() => navigate("/grocery/home")}
              className="inline-flex items-center btn-secondary px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                </h2>

                {cartDetails.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="cart-item-image w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-600 mt-2">
                          Price:{" "}
                          <span className="font-medium">
                            ₹{item.price || "0.00"}
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            onClick={() => handleRemove(item.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <FaMinus className="text-sm text-gray-600" />
                        </button>
                        <input
                          type="text"
                          readOnly
                          value={item.quantity}
                          className="w-12 text-center border border-gray-300 rounded-md py-1 text-sm text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <FaPlus className="text-sm text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <button
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium px-4 py-2 rounded-lg inline-flex items-center transition-colors duration-200"
                    onClick={() => navigate("/grocery/home")}
                  >
                    <FaArrowLeft className="mr-2" />
                    Continue Shopping
                  </button>
                </div>

                {/* AI Suggestions Section */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                    <FaMagic className="text-indigo-600" /> AI Suggests Adding:
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 -mt-2">
                    Based on your current cart items
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Organic Honey",
                        price: 150,
                        reason: "Often bought with Tea",
                      },
                      {
                        name: "Whole Wheat Bread",
                        price: 40,
                        reason: "Goes well with Butter",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <FaShoppingBag />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-indigo-500 font-medium">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                          <FaPlus size={10} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="flex justify-between mb-4">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900 font-medium">
                    ₹{subtotal.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between mb-4">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900 font-medium">
                    ₹{shipping.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between mb-4">
                  <p className="text-gray-600">Tax (10%)</p>
                  <p className="text-gray-900 font-medium">₹{tax.toFixed(2)}</p>
                </div>

                <div className="border-t border-gray-100 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-lg font-semibold text-gray-900">Total</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{grandTotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Proceed to Checkout
                  </button>
                </div>

                {/* Promo Code */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Promo Code
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors duration-200">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} LuxeCart. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200">
                Terms of Service
              </button>
              <button className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
