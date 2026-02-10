import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaExclamationCircle,
  FaPrint,
  FaTruck,
  FaBox,
  FaHome,
  FaShoppingBag,
  FaHistory,
} from "react-icons/fa";
import NavBars from "../NavBars";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const baseUrl = "https://grocery-ai.onrender.com";

  const fetchOrderDetails = useCallback(async () => {
    try {
      // Don't parse ID, use the string directly
      const response = await axios.get(`${baseUrl}/api/order/${orderId}`, {
        headers: {
          Authorization: token,
        },
      });
      console.log(response, "S");
      if (response.data && response.data.order && response.data.items) {
        setOrder(response.data.order);
        setItems(response.data.items);
      } else {
        setError("Something went wrong while fetching your order.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  const handleGoToOrders = () => {
    navigate("/grocery/home/order-history", { replace: true });
  };

  const handleContinueShopping = () => {
    navigate("/grocery/home", { replace: true });
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Removed legacy redirect timer

  // ------------ Derived fields from order ------------

  const createdAtDate = order?.created_at
    ? new Date(order.created_at)
    : new Date();

  const orderDateText = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const deliveryDate = new Date(createdAtDate);
  deliveryDate.setDate(createdAtDate.getDate() + 5);
  const deliveryDateText = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const totalAmount = order?.total_amount ?? order?.total ?? order?.amount;
  const subtotal =
    order?.subtotal ?? order?.sub_total ?? (totalAmount ? totalAmount : null);
  const shipping =
    order?.shipping_fee ?? order?.shipping ?? order?.shipping_amount ?? 0;

  const customerEmail =
    order?.email || order?.user_email || order?.customer_email || null;

  const displayOrderId = order?.order_number
    ? `#${order.order_number}`
    : `#${orderId}`;

  // ------------ STATES: LOADING / ERROR / NOT FOUND ------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-800">
            Fetching your order details...
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Please wait while we confirm your order.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-red-200 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-center mb-3">
            <FaExclamationCircle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-base font-semibold text-red-700 text-center">
            Something went wrong
          </h2>
          <p className="mt-1 text-xs text-gray-600 text-center">{error}</p>
          <button
            type="button"
            onClick={handleGoToOrders}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-center mb-3">
            <FaExclamationCircle className="text-amber-500 text-3xl" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 text-center">
            Order not found
          </h2>
          <p className="mt-1 text-xs text-gray-600 text-center">
            We couldn’t find the order you’re looking for.
          </p>
          <button
            type="button"
            onClick={handleGoToOrders}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  // ------------ MAIN UI (Template-based) ------------

  return (
    <div className="bg-gray-50 text-gray-800 antialiased min-h-screen flex flex-col">
      {/* Checkmark animation CSS – you can move this to global CSS if you like */}
      <style>{`
        .checkmark-circle {
          width: 80px;
          height: 80px;
          position: relative;
          display: inline-block;
          vertical-align: top;
          border-radius: 50%;
          background-color: #10B981;
          animation: scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        .checkmark-circle::before {
          content: "";
          display: block;
          width: 25px;
          height: 45px;
          border: solid white;
          border-width: 0 5px 5px 0;
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          animation: check-mark 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
          opacity: 0;
        }
        @keyframes scale-in {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes check-mark {
          0% { opacity: 0; height: 0; width: 0; }
          100% { opacity: 1; height: 45px; width: 25px; }
        }
      `}</style>

      {/* headder */}

      <NavBars />
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="checkmark-circle shadow-lg shadow-emerald-100"></div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Thank you for your order!
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We&apos;ve received your order and will begin processing it right
            away. You will receive an email confirmation shortly
            {customerEmail && (
              <>
                {" "}
                at{" "}
                <span className="font-medium text-gray-900">
                  {customerEmail}
                </span>
              </>
            )}
            .
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-10 lg:p-12">
              {/* Header of Receipt */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 pb-8 mb-8 gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                    Order Number
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {displayOrderId}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                    Date
                  </p>
                  <p className="text-lg text-gray-900 mt-1">{orderDateText}</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    Invoice
                    <FaPrint className="ml-2" />
                  </button>
                </div>
              </div>

              {/* Order Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Order Items */}
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Order Items
                  </h2>
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-100">
                      {items.length > 0 ? (
                        items.map((item, idx) => {
                          const itemPrice = item.price || item.unit_price;
                          const itemQty = item.quantity || item.qty || 1;
                          const imageUrl = item.product_image || "";
                          const variantText =
                            item.variant ||
                            item.variant_name ||
                            item.size ||
                            item.color ||
                            null;

                          return (
                            <li key={idx} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                <img
                                  src={imageUrl}
                                  alt={item.product_name || "Product"}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      <span>{item.product_name}</span>
                                    </h3>
                                    <p className="ml-4">₹{itemPrice || 0}</p>
                                  </div>
                                  {variantText && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      {variantText}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500">Qty {itemQty}</p>
                                </div>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <li className="py-6 text-sm text-gray-500">
                          No products found in this order.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Order Summary & Info */}
                <div className="bg-gray-50 rounded-lg p-6 lg:col-span-1 h-fit">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 border-b border-gray-200 pb-4 text-sm">
                    {subtotal && (
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span>{shipping ? `₹${shipping}` : "₹238"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 text-base font-bold text-gray-900">
                    <span>Order Total</span>
                    <span>
                      {totalAmount
                        ? `₹${(Number(totalAmount) || 0) + 238}`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Next Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBox className="text-blue-500" />
                </div>
                <h5 className="font-medium mb-1">Processing</h5>
                <p className="text-gray-600 text-sm">
                  We&apos;re preparing your order
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTruck className="text-yellow-500" />
                </div>
                <h5 className="font-medium mb-1">Shipped</h5>
                <p className="text-gray-600 text-sm">
                  Your order is on the way
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaHome className="text-green-500" />
                </div>
                <h5 className="font-medium mb-1">Delivered</h5>
                <p className="text-gray-600 text-sm">
                  Expected by {deliveryDateText}
                </p>
              </div>
            </div>
          </div>

          {/* Actions under Next Steps */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={handleContinueShopping}
              className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300 flex items-center justify-center"
            >
              <FaShoppingBag className="mr-2" />
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={handleGoToOrders}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
            >
              <FaHistory className="mr-2" />
              View Order History
            </button>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <button className="text-indigo-600 hover:text-indigo-500 font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
