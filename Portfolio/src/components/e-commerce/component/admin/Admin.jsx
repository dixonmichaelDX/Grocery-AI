import React from "react";
import { useNavigate } from "react-router-dom";
import adminCss from "./admin.module.css";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Users,
  LogOut,
  User,
  Sparkles,
  BarChart3
} from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  const dashboardItems = [
    {
      title: "Categories",
      description: "Manage product categories and their organization",
      icon: <Layers size={24} />,
      path: "/grocery/admin/admincategory"
    },
    {
      title: "Subcategories",
      description: "Manage specific sub-categories for products",
      icon: <Layers size={24} />,
      path: "/grocery/admin/adminsubcategory"
    },
    {
      title: "Products",
      description: "Add, edit, or remove products from the inventory",
      icon: <ShoppingBag size={24} />,
      path: "/grocery/admin/adminproduct"
    },
    {
      title: "Users",
      description: "View and manage registered users",
      icon: <Users size={24} />,
      path: "/grocery/admin/users"
    },
    {
      title: "Demand Prediction",
      description: "AI-powered sales forecasting and alerts",
      icon: <Sparkles size={24} />,
      path: "/grocery/admin/demand-prediction"
    },
    {
      title: "Rec. Analytics",
      description: "Analyze recommendation engine performance",
      icon: <BarChart3 size={24} />,
      path: "/grocery/admin/recommendation-analytics"
    }
  ];

  return (
    <div className={adminCss.dashboardWrapper}>
      {/* Navbar */}
      <header className={adminCss.topNav}>
        <div className={adminCss.logo}>
          <LayoutDashboard size={28} />
          <span>AdminHub</span>
        </div>
        <nav className={adminCss.navLinks}>
          <div className={adminCss.userName}>
            <div className={adminCss.profilePic}>
              <User size={20} />
            </div>
            <span>Admin</span>
          </div>
          <button onClick={logoutButton} className={adminCss.logoutBtn}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className={adminCss.dashboardMain}>
        <div className={adminCss.welcomeSection}>
          <h1 className={adminCss.welcomeTitle}>Welcome back, Admin</h1>
          <p className={adminCss.welcomeSubtitle}>Here's what's happening with your store today.</p>
        </div>

        <div className={adminCss.cardContainer}>
          {dashboardItems.map((item, index) => (
            <div
              key={index}
              className={adminCss.dashboardCard}
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
            >
              <div className={adminCss.cardIconWrapper}>
                {item.icon}
              </div>
              <h3 className={adminCss.cardTitle}>{item.title}</h3>
              <p className={adminCss.cardDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;
