import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import DemandChart from "../../../Shared/DemandChart";

const DemandPrediction = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [predictionStats, setPredictionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("forecast"); // forecast, train, alerts

  // Training State
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && activeTab === "forecast") {
      fetchPrediction(selectedProduct);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "https://grocery-ai.onrender.com/api/products",
      );
      const productList = res.data.products || [];
      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProduct(productList[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  const fetchPrediction = async (id) => {
    setLoading(true);
    setError("");

    // Static Mock Data Generation based on Product ID/Name
    // This ensures every product has "data" even if backend is empty
    const generateMockData = (productId) => {
      const product = products.find((p) => p._id === productId);
      const baseDemand = product ? (product.price % 100) + 50 : 100; // Random-ish base

      return {
        data: [
          {
            date: "2025-01-01",
            actual: baseDemand - 10,
            predicted: baseDemand - 8,
          },
          {
            date: "2025-01-02",
            actual: baseDemand + 5,
            predicted: baseDemand + 2,
          },
          { date: "2025-01-03", actual: baseDemand - 2, predicted: baseDemand },
          {
            date: "2025-01-04",
            actual: baseDemand + 15,
            predicted: baseDemand + 12,
          },
          {
            date: "2025-01-05",
            actual: baseDemand + 8,
            predicted: baseDemand + 10,
          },
          { date: "2025-01-06", actual: null, predicted: baseDemand + 15 }, // Future
          { date: "2025-01-07", actual: null, predicted: baseDemand + 18 },
        ],
        stats: {
          confidence: `${85 + (baseDemand % 10)}%`,
          growth: `+${baseDemand % 20}%`,
          growthDesc: "Rising demand expected",
          stock: "High",
        },
      };
    };

    try {
      // Try fetching from API first
      // const token = localStorage.getItem('token');
      // const res = await axios.get(`https://grocery-ai.onrender.com/api/prediction/demand/${id}`, {
      //     headers: { Authorization: `Bearer ${token}` }
      // });
      // setPredictionData(res.data.data);
      // setPredictionStats(res.data.stats);

      // FOR DEMO: Simulate API delay then use Mock
      setTimeout(() => {
        const mock = generateMockData(id);
        setPredictionData(mock.data);
        setPredictionStats(mock.stats);
        setLoading(false);
      }, 800);
    } catch (err) {
      // Fallback to mock on error
      const mock = generateMockData(id);
      setPredictionData(mock.data);
      setPredictionStats(mock.stats);
      setLoading(false);
    }
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/grocery/admin")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-indigo-600"
            title="Back to Dashboard"
          >
            <LayoutDashboard size={24} />
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Demand Forecasting AI
          </h2>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["forecast", "train", "alerts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: FORECAST */}
      {activeTab === "forecast" && (
        <div className="animate-fadeIn">
          <div className="flex justify-end mb-4">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : (
            <>
              <DemandChart
                data={predictionData}
                title={`Projected Demand for ${products.find((p) => p._id === selectedProduct)?.name || "Selected Product"}`}
              />

              {predictionStats && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-600 mb-2">
                      Confidence Score
                    </h4>
                    <p className="text-3xl font-bold text-gray-800">
                      {predictionStats.confidence}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Based on historical variance
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <h4 className="text-sm font-medium text-green-600 mb-2">
                      Growth Trend
                    </h4>
                    <p className="text-3xl font-bold text-gray-800">
                      {predictionStats.growth}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {predictionStats.growthDesc}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-medium text-purple-600 mb-2">
                      Stock Level
                    </h4>
                    <p className="text-3xl font-bold text-gray-800">
                      {predictionStats.stock}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      Sufficient for next 14 days
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: TRAIN */}
      {activeTab === "train" && (
        <div className="bg-white p-8 rounded-xl border border-gray-100 animate-fadeIn">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl">
              🚀
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Train New Demand Model
            </h3>
            <p className="text-gray-500">
              Upload your latest sales CSV to retrain the forecasting engine for
              better accuracy.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:bg-gray-50 transition cursor-pointer mb-6">
              <p className="text-gray-600 font-medium">
                Drag & Drop sales_data.csv here
              </p>
              <p className="text-xs text-gray-400 mt-2">or click to browse</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await axios.post(
                      "https://grocery-ai.onrender.com/api/seed/demand",
                    );
                    alert(
                      "Mock demand data seeded successfully! You can now view forecasts.",
                    );
                  } catch (e) {
                    alert(
                      "Seeding failed: " +
                      (e.response?.data?.message || e.message),
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Seed Mock Data (Demo)
              </button>
            </div>

            {isTraining ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Training Neural Network...</span>
                  <span>{trainingProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTrainModel}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition"
              >
                Start Training
              </button>
            )}

            {trainingProgress === 100 && !isTraining && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm font-semibold">
                Training Complete! Model updated v2.4
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ALERTS */}
      {activeTab === "alerts" && (
        <div className="space-y-4 animate-fadeIn">
          {[
            {
              id: 1,
              type: "critical",
              msg: 'Stock Depletion Risk: "Amul Butter" predicted to run out in 2 days.',
              date: "2 hrs ago",
            },
            {
              id: 2,
              type: "warning",
              msg: 'Demand Spike: "Whole Wheat Bread" sales +40% above forecast.',
              date: "5 hrs ago",
            },
            {
              id: 3,
              type: "info",
              msg: "Model drift detected. Recommendation: Retrain model.",
              date: "1 day ago",
            },
          ].map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-l-4 shadow-sm bg-white flex justify-between items-center ${alert.type === "critical"
                ? "border-red-500"
                : alert.type === "warning"
                  ? "border-yellow-500"
                  : "border-blue-500"
                }`}
            >
              <div>
                <h4
                  className={`font-bold text-sm ${alert.type === "critical"
                    ? "text-red-600"
                    : alert.type === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
                    } uppercase tracking-wider mb-1`}
                >
                  {alert.type} Alert
                </h4>
                <p className="text-gray-800 font-medium">{alert.msg}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {alert.date}
              </span>
            </div>
          ))}

          <button className="w-full py-3 text-center text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-lg border border-dashed border-gray-300 transition">
            Load Older Alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default DemandPrediction;
