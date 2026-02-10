import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import {
  FaBox,
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const Seller = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [getSubCategoryDetails, setGetSubCategoryDetails] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'low', 'out'

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const UN = localStorage.getItem("user");
  const baseUrl = "https://grocery-ai.onrender.com";

  // Dashboard Metrics
  const totalOrders = productDetails.length;
  const totalQuantity = productDetails.reduce(
    (sum, item) => sum + Number(item.quantity),
    0,
  );
  const lowStockCount = productDetails.filter(
    (p) => p.quantity > 0 && p.quantity < 10,
  ).length;
  const outOfStockCount = productDetails.filter((p) => p.quantity === 0).length;

  const fetchProducts = useCallback(() => {
    axios
      .get(`${baseUrl}/api/products/my-products`, {
        headers: { Authorization: token },
      })
      .then((res) => setProductDetails(res.data.products))
      .catch((err) => console.log("Fetch my-products error", err));
  }, [token, baseUrl]);

  const fetchCategories = () => {
    axios
      .get(`${baseUrl}/api/category`)
      .then((res) => setGetCategoryDetails(res.data))
      .catch((err) => console.log("Fetch category error", err));
  };

  const fetchSubCategories = (categoryId) => {
    axios
      .get(`${baseUrl}/api/subcategories/category/${categoryId}`)
      .then((res) => setGetSubCategoryDetails(res.data))
      .catch((err) => {
        console.error("Failed to fetch subcategories", err);
        setGetSubCategoryDetails([]);
      });
  };

  const productDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`${baseUrl}/api/products/${productId}`, {
          headers: { Authorization: token },
        })
        .then(() => fetchProducts())
        .catch((err) => console.log("DeleteError", err));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("quantity", productQuantity);
    formData.append("description", productDescription);
    formData.append("image", productImage);
    formData.append("category_id", productCategory);
    formData.append("sub_category_id", productSubCategory);

    try {
      await axios.post(`${baseUrl}/api/products/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handlEditProduct = async (e, productId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("quantity", productQuantity);
    formData.append("description", productDescription);
    if (productImage) formData.append("image", productImage);

    try {
      await axios.put(`${baseUrl}/api/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.log("errorEdit", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setProductName("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setProductSubCategory("");
    setProductImage(null);
    setProductDescription("");
  };

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  useEffect(() => {
    if (productCategory) fetchSubCategories(productCategory);
    else setGetSubCategoryDetails([]);
  }, [productCategory]);

  const filteredProducts = productDetails.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterStatus === "low")
      matchesFilter = product.quantity < 10 && product.quantity > 0;
    if (filterStatus === "out") matchesFilter = product.quantity === 0;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-green-500/10 to-blue-500/10 -z-10 rounded-b-[3rem]" />

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl text-white shadow-lg shadow-green-200">
                <FaBox size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  Seller Portal
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  INVENTORY MANAGEMENT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{UN}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium">
                  <FaCheckCircle size={10} /> Verified Seller
                </div>
              </div>
              <button
                onClick={logoutButton}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                title="Logout"
              >
                <FaSignOutAlt size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Stats Cards - Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl shadow-inner">
                <FaClipboardList size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Total Products
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalOrders}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shadow-inner">
                <FaBox size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Total Items
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalQuantity}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
                <FaExclamationTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Low Stock
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {lowStockCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-300 text-white flex flex-col justify-center items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-bl-[100px] transition-transform group-hover:scale-110" />
            <h3 className="font-bold text-xl mb-2 relative z-10">
              Add New Item
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-auto bg-green-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 hover:bg-green-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <FaPlus size={14} /> Create Product
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60 overflow-hidden">
          {/* Table Header / Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Inventory Monitoring
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your product stock levels.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Filter Tabs */}
              <div className="flex p-1 bg-gray-100/80 rounded-xl">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("low")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${filterStatus === "low" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Low Stock
                  {lowStockCount > 0 && (
                    <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-[10px]">
                      {lowStockCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilterStatus("out")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${filterStatus === "out" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Out of Stock
                  {outOfStockCount > 0 && (
                    <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                      {outOfStockCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 w-full sm:w-64 bg-gray-50/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-8 py-5 font-semibold">Product</th>
                  <th className="px-6 py-5 font-semibold">Category</th>
                  <th className="px-6 py-5 font-semibold">Price</th>
                  <th className="px-6 py-5 font-semibold text-center">
                    Status
                  </th>
                  <th className="px-6 py-5 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-gray-50/80 transition-all duration-200"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Grocery
                        </span>
                      </td>
                      <td className="px-6 py-5 font-semibold text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                product.quantity === 0
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : product.quantity < 10
                                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                                    : "bg-green-50 text-green-600 border border-green-100"
                              }`}
                          >
                            {product.quantity === 0 && (
                              <FaExclamationTriangle
                                className="mr-1.5"
                                size={10}
                              />
                            )}
                            {product.quantity} in stock
                          </span>
                          {product.quantity < 10 && product.quantity > 0 && (
                            <span className="text-[10px] text-orange-500 font-medium">
                              Low Stock Warning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setIsModalOpen(true);
                              setIsEditing(true);
                              setCurrentEditId(product.id);
                              setProductName(product.name);
                              setProductPrice(product.price);
                              setProductQuantity(product.quantity);
                              setProductDescription(product.description || "");
                            }}
                            className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => productDelete(product.id)}
                            className="p-2 text-red-600 bg-red-50/50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <FaBox className="text-gray-400 text-3xl" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          No inventory items found
                        </p>
                        <p className="text-sm text-gray-400">
                          Try adjusting your filters or search.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal - Premium Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in duration-200 border border-gray-100 relative">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Material" : "Add Inventory"}
                </h2>
                <p className="text-sm text-gray-500">
                  Fill in the details below
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <form
                onSubmit={(e) =>
                  isEditing
                    ? handlEditProduct(e, currentEditId)
                    : handleAddProduct(e)
                }
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    required
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter product name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      required
                      type="number"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none cursor-pointer"
                        disabled={isEditing}
                      >
                        <option value="">Select Category</option>
                        {getCategoryDetails.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 4.5L6 8L9.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SubCategory
                    </label>
                    <div className="relative">
                      <select
                        value={productSubCategory}
                        onChange={(e) => setProductSubCategory(e.target.value)}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none cursor-pointer disabled:opacity-50"
                        disabled={!productCategory || isEditing}
                      >
                        <option value="">Select SubCategory</option>
                        {getSubCategoryDetails.map((sub) => (
                          <option
                            key={sub.subcategory_id || sub.id}
                            value={sub.subcategory_id || sub.id}
                          >
                            {sub.subcategory_name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 4.5L6 8L9.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-all group">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <FaPlus className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium group-hover:text-green-600">
                        {productImage
                          ? productImage.name
                          : "Click to upload image"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setProductImage(e.target.files[0])}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none transition-all placeholder:text-gray-400"
                    placeholder="Describe the product features..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide"
                  >
                    {isEditing ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Seller;
