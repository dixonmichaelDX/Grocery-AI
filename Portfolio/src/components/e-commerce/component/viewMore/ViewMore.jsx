import React, { useMemo, useState } from "react";

import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../NavBar";
import DemandChart from "../../../Shared/DemandChart";

const ViewMore = () => {
  const navigate = useNavigate();
  const { state: ViewMoreDetails } = useLocation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addStatus, setAddStatus] = useState("idle");
  const token = localStorage.getItem("token");
  const images = useMemo(() => {
    const base = ViewMoreDetails.image_url;
    return [base, base, base];
  }, [ViewMoreDetails.image_url]);

  async function handleAddCart(product) {
    if (!token) {
      navigate("/grocery/login");
      return;
    }

    const cartGetItem = {
      product_id: product.id || product._id,
      quantity: 1,
    };

    try {
      setAddStatus("loading");

      await axios.post(
        "https://grocery-ai.onrender.com/api/cart/add",
        cartGetItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );

      setAddStatus("success");

      // Redirect to cart
      setTimeout(() => {
        navigate("/grocery/home/cart");
      }, 600);
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error.response?.data || error.message,
      );
      setAddStatus("idle");
    }
  }

  if (!ViewMoreDetails || !ViewMoreDetails.image_url) {
    return <div style={{ padding: "20px" }}>Loading product...</div>;
  }

  const formattedPrice = ViewMoreDetails.price
    ? `₹${ViewMoreDetails.price}`
    : "₹0";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start fade-in">
          {/* ---------------- PRODUCT IMAGES ---------------- */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[activeImageIndex]}
                alt={ViewMoreDetails.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex space-x-4 mt-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${
                    activeImageIndex === index
                      ? "border-gray-900"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <img
                    alt=""
                    src={img}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- PRODUCT DETAILS ---------------- */}
          <div className="space-y-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {ViewMoreDetails.category || "Product"}
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
              {ViewMoreDetails.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                ({ViewMoreDetails.reviews_count || 128} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg">
              {ViewMoreDetails.description || "No description available."}
            </p>

            {/* Price */}
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">
                {formattedPrice}
              </span>
            </div>

            {/* ---------------- ADD TO CART BUTTON ---------------- */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => handleAddCart(ViewMoreDetails)}
                disabled={addStatus === "loading"}
                className={`flex-1 py-4 px-8 rounded-lg font-semibold text-lg flex items-center justify-center transition ${
                  addStatus === "success"
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {addStatus === "loading" && "Adding..."}

                {addStatus === "idle" && "Add to Cart"}

                {addStatus === "success" && (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Added to Cart!
                  </>
                )}
              </button>

              {/* Wishlist (static for now) */}
              <button className="p-4 border border-gray-300 rounded-lg hover:border-gray-900">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Prediction Chart */}
            <div className="border-t pt-6">
              <DemandChartWrapper
                productId={ViewMoreDetails.id || ViewMoreDetails._id}
                productName={ViewMoreDetails.name}
              />
            </div>

            {/* Extra Info */}
            <div className="pt-6 space-y-4">
              <p>✔ Free shipping on orders over ₹1000</p>
              <p>✔ 30-day return policy</p>
              <p>✔ Freshness Guaranteed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const DemandChartWrapper = ({ productId, productName }) => {
  const [data, setData] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Allow public views if needed, or require login.
        // If require login, user might not see it if not logged in.
        // Assuming existing token usage.
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `https://grocery-ai.onrender.com/api/prediction/demand/${productId}`,
          { headers },
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load prediction", err);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  if (!data) return null;

  return (
    <div className="mt-4">
      <DemandChart data={data} title={`Demand Trend: ${productName}`} />
    </div>
  );
};

export default ViewMore;
