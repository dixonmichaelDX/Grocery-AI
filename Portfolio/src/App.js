import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./components/e-commerce/component/home/Home";
import Seller from "./components/e-commerce/component/seller/Seller";
import ProtectedRoute from "./components/e-commerce/ProtectedRoute";
import Product from "./components/e-commerce/component/seller/SellerProduct";
import Register from "./components/e-commerce/component/register/Register";
import LoginPage from "./components/e-commerce/component/login/LoginPage";
import Admin from "./components/e-commerce/component/admin/Admin";
import AdminCategory from "./components/e-commerce/component/admin/adminCategory/AdminCategory";
import AdminSubCategory from "./components/e-commerce/component/admin/adminSubCategory/AdminSubCategory";

import ViewMore from "./components/e-commerce/component/viewMore/ViewMore";
import Cart from "./components/e-commerce/component/cart/Cart";
import PlaceOrder from "./components/e-commerce/component/placeOrder/PlaceOrder";
import OrderConfirmation from "./components/e-commerce/component/orderConfirmation/OrderConfirmation";
import OrderHistory from "./components/e-commerce/component/orderHistory/OrderHistory";

import AdminProduct from "./components/e-commerce/component/admin/adminProduct/AdminProduct";
import AdminUsers from "./components/e-commerce/component/admin/adminUsers/AdminUsers";
import DemandPrediction from "./components/e-commerce/component/admin/DemandPrediction";
import RecommendationAnalytics from "./components/e-commerce/component/admin/RecommendationAnalytics";
import Ecom from "./components/e-commerce/Ecom";
import { useState } from "react";
import { useEffect } from "react";

import "./App.css";

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Progress loader
  useEffect(() => {
    const duration = 3000;
    const interval = 50;
    let time = 0;

    const timer = setInterval(() => {
      time += interval;
      setProgress(Math.min((time / duration) * 100, 100));
      if (time >= duration) {
        clearInterval(timer);
        setTimeout(() => setLoading(false), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const [ViewMoreDetails, setViewMoreDetails] = useState(null);


  return (
    <div className="relative min-h-full bg-white text-gray-900 overflow-hidden">

      {loading ? (
        <div className="loading-screen">
          <div className="loading-box">
            <h2 className="loading-text">Loading Grocery...</h2>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="loading-percent">{Math.floor(progress)}%</p>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/grocery" replace />} />
          <Route
            path="/grocery/home"
            element={
              <ProtectedRoute
                element={<Home setViewMoreDetails={setViewMoreDetails} />}
                allowedRoles={["customer"]}
              />
            }
          />

          <Route
            path="/grocery/home/viewmore"

            element={<ViewMore ViewMoreDetails={ViewMoreDetails} />}



          />
          <Route
            path="/grocery/home/place-order"
            element={
              <ProtectedRoute
                element={<PlaceOrder />}
                allowedRoles={["customer"]}
              />
            }
          />
          <Route
            path="/grocery/home/order-confirmation/:orderId"
            element={
              <ProtectedRoute
                element={<OrderConfirmation />}
                allowedRoles={["customer", "seller", "admin"]}
              />
            }
          />
          <Route
            path="/grocery/home/order-history"
            element={<OrderHistory />}
          />
          <Route path="/grocery/home/cart" element={<Cart />} />

          {/* Seller Routes */}
          <Route
            path="/grocery/seller"
            element={
              <ProtectedRoute element={<Seller />} allowedRoles={["seller"]} />
            }
          />
          <Route
            path="/grocery/seller/product"
            element={
              <ProtectedRoute element={<Product />} allowedRoles={["seller"]} />
            }
          />

          {/* Admin Routes */}
          <Route
            path="/grocery/admin"
            element={
              <ProtectedRoute element={<Admin />} allowedRoles={["admin"]} />
            }
          />
          <Route
            path="/grocery/admin/admincategory"
            element={
              <ProtectedRoute
                element={<AdminCategory />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/grocery/admin/adminsubcategory"
            element={
              <ProtectedRoute
                element={<AdminSubCategory />}
                allowedRoles={["admin"]}
              />
            }
          />

          <Route
            path="/grocery/admin/adminProduct"
            element={
              <ProtectedRoute
                element={<AdminProduct />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/grocery/admin/users"
            element={
              <ProtectedRoute
                element={<AdminUsers />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/grocery/admin/demand-prediction"
            element={
              <ProtectedRoute
                element={<DemandPrediction />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/grocery/admin/recommendation-analytics"
            element={
              <ProtectedRoute
                element={<RecommendationAnalytics />}
                allowedRoles={["admin"]}
              />
            }
          />

          {/* Other pages - REMOVED */}
          {/* <Route path="/calculator" element={<Calculator />} /> */}
          {/* <Route path="/todolist" element={<TodoList />} */}
          {/* <Route path="/weather" element={<WeatherApp />} /> */}

          {/* E-commerce wrapper (non-routing) */}
          <Route
            path="grocery/*"
            element={
              <Ecom
                ViewMoreDetails={ViewMoreDetails}
                setViewMoreDetails={setViewMoreDetails}
              />
            }
          />

          {/* Register */}
          <Route path="/grocery/register" element={<Register />} />
          <Route path="/grocery/login" element={<LoginPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
