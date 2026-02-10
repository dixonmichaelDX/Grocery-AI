import Home from "./component/home/Home";
import LoginPage from "./component/login/LoginPage";
import Seller from "./component/seller/Seller";
import ProtectedRoute from "./ProtectedRoute";
import Product from "./component/seller/SellerProduct";
import Register from "./component/register/Register";
import Admin from "./component/admin/Admin";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminCategory from "./component/admin/adminCategory/AdminCategory";
import AdminSubCategory from "./component/admin/adminSubCategory/AdminSubCategory";

import ViewMore from "./component/viewMore/ViewMore";
import { useEffect, useState } from "react";
import Cart from "./component/cart/Cart";
import PlaceOrder from "./component/placeOrder/PlaceOrder";
import OrderConfirmation from "./component/orderConfirmation/OrderConfirmation";
import OrderHistory from "./component/orderHistory/OrderHistory";

import AdminProduct from "./component/admin/adminProduct/AdminProduct";
import DemandPrediction from "./component/admin/DemandPrediction";
import AdminUsers from "./component/admin/adminUsers/AdminUsers";


function Ecom() {
  const navigate = useNavigate();
  const [ViewMoreDetails, setViewMoreDetails] = useState(null);
  const [chkTok, setChkTok] = useState(null)
  // Session expiry
  useEffect(() => {
    const token = localStorage.getItem("token");
    setChkTok(token)
    const interval = setInterval(() => {

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Session expired. Please log in again.");
        navigate("/grocery");
      }
    }, 3600000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Fetch cart count on load

  return (
    <>
      {/* {chkTok ? (
        <BackButton />
      ) : (
        <></>

      )
      } */}
      <div></div>
      <Routes>
        <Route path="/grocery/login" element={<LoginPage />} />

        <Route
          path="/"

          element={<Home setViewMoreDetails={setViewMoreDetails} />}



        />
        {/* {console.log(ViewMoreDetails)} */}
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
          allowedRoles={["customer"]}
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
          allowedRoles={["customer", "seller", "admin"]}
        />
        <Route
          path="/grocery/home/cart"
          element={<Cart />}
          allowedRoles={["customer"]}
        />
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
        <Route path="/grocery/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />

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
          path="/grocery/admin/demand-prediction"
          element={
            <ProtectedRoute
              element={<DemandPrediction />}
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
      </Routes>
    </>
  );
}

export default Ecom;
