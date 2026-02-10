import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  LogOut,
  User,
  Mail,
  Shield,
  Calendar,
  AlertCircle,
  Users,
} from "lucide-react";

const AdminUsers = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://grocery-ai.onrender.com/api/users",
          {
            headers: { Authorization: token },
          },
        );
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.warn(
            "Unexpected users API response structure:",
            response.data,
          );
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch users",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    } else {
      navigate("/grocery/login");
    }
  }, [token, navigate]);

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  // Filter helpers
  const getCustomers = () =>
    users.filter((u) => u.role?.toLowerCase() !== "seller");
  const getSellers = () =>
    users.filter((u) => u.role?.toLowerCase() === "seller");

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20 shadow-sm/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="text-indigo-600" /> User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Admin Dashboard &gt; Users
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/grocery/admin")}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <Home size={16} /> Dashboard
            </button>
            <button
              onClick={logoutButton}
              className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>Error: {error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customers Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="text-blue-500" size={20} />
                Customers
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {getCustomers().length}
                </span>
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : getCustomers().length > 0 ? (
                    getCustomers().map((user, i) => (
                      <tr
                        key={user._id || i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sellers Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-purple-500" size={20} />
                Sellers
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                  {getSellers().length}
                </span>
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : getSellers().length > 0 ? (
                    getSellers().map((user, i) => (
                      <tr
                        key={user._id || i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No sellers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
