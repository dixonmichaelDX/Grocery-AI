import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  Package,
  CheckCircle,
  X,
  Search,
  Filter,
} from "lucide-react";

const AdminProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [productDetails, setProductDetails] = useState([]);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Product fields
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  // Category data
  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [getSubCategoryDetails, setGetSubCategoryDetails] = useState([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'low', 'out'

  // ------------------------------
  // Fetch functions
  // ------------------------------
  const fetchProducts = useCallback(() => {
    axios
      .get("https://grocery-ai.onrender.com/api/products/allProducts", {
        headers: { Authorization: token },
      })
      .then((res) => setProductDetails(res.data.products))
      .catch((err) => console.log("Fetch my-products error", err));
  }, [token]);

  const fetchCategories = () => {
    axios
      .get("https://grocery-ai.onrender.com/api/category")
      .then((res) => setGetCategoryDetails(res.data))
      .catch((err) => console.log("Fetch category error", err));
  };

  const fetchSubCategories = (categoryId) => {
    axios
      .get(
        `https://grocery-ai.onrender.com/api/subcategories/category/${categoryId}`,
      )
      .then((res) => setGetSubCategoryDetails(res.data))
      .catch((err) => {
        console.error("Failed to fetch subcategories", err);
        setGetSubCategoryDetails([]);
      });
  };

  // ------------------------------
  // Effects
  // ------------------------------
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  useEffect(() => {
    if (productCategory) fetchSubCategories(productCategory);
    else setGetSubCategoryDetails([]);
  }, [productCategory]);

  // ------------------------------
  // Auth / Logout
  // ------------------------------
  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  // ------------------------------
  // CRUD functions
  // ------------------------------
  const productDelete = (productId) => {
    if (!productId) return;

    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`https://grocery-ai.onrender.com/api/products/${productId}`, {
          headers: { Authorization: token },
        })
        .then(() => {
          fetchProducts();
        })
        .catch((err) => {
          console.error("DeleteError", err);
          alert(
            "Failed to delete: " + (err.response?.data?.message || err.message),
          );
        });
    }
  };

  const handlEditProduct = async (e, productId) => {
    e.preventDefault();

    if (!productName || !productPrice || !productQuantity) {
      alert("Name, Price, and Quantity are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", Number(productPrice));
    formData.append("quantity", Number(productQuantity));
    formData.append("description", productDescription);
    formData.append("category_id", productCategory);
    formData.append("subcategory_id", productSubCategory);

    if (productImage instanceof File) {
      formData.append("image", productImage);
    }

    try {
      await axios.put(
        `https://grocery-ai.onrender.com/api/products/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        },
      );

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("❌ Update failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!productName || !productPrice || !productQuantity || !productImage) {
      alert("Name, Price, Quantity, and Image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", Number(productPrice));
    formData.append("quantity", Number(productQuantity));
    formData.append("category_id", productCategory);
    formData.append("subcategory_id", productSubCategory);
    formData.append("image", productImage);

    try {
      await axios.post(
        "https://grocery-ai.onrender.com/api/products/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        },
      );

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("❌ Add failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Add failed");
    }
  };

  const closeModal = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentEditId(null);
    setProductName("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setProductSubCategory("");
    setProductImage(null);
    setPreviewImage(null);
    setProductDescription("");
  };

  // Metrics
  const lowStockCount = productDetails.filter(
    (p) => p.quantity > 0 && p.quantity < 10,
  ).length;
  const outOfStockCount = productDetails.filter((p) => p.quantity === 0).length;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 flex flex-col">
      <Outlet />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20 shadow-sm/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Package className="text-indigo-600" /> Product Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Admin Dashboard &gt; Products
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/grocery/admin")}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <Home size={16} /> Dashboard
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Product
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "DANGER: Are you sure you want to delete ALL products? This cannot be undone.",
                  )
                ) {
                  if (
                    window.confirm("Please confirm again. DELETE ALL PRODUCTS?")
                  ) {
                    try {
                      await axios.delete(
                        "https://grocery-ai.onrender.com/api/seed/products/all",
                        {
                          headers: { Authorization: token },
                        },
                      );
                      alert("All products deleted.");
                      fetchProducts();
                    } catch (e) {
                      alert(
                        "Failed to delete products: " +
                          (e.response?.data?.message || e.message),
                      );
                    }
                  }
                }
              }}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} /> Delete All
            </button>
            <button
              onClick={logoutButton}
              className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-8 space-y-6">
        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Cards */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setStockFilter("all")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${stockFilter === "all" ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-500/20" : "bg-white border-gray-200 hover:border-indigo-200"}`}
            >
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Total Products
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {productDetails.length}
              </h3>
            </div>
            <div
              onClick={() => setStockFilter("low")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${stockFilter === "low" ? "bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-500/20" : "bg-white border-gray-200 hover:bg-orange-50/50"}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-xs text-orange-600 font-semibold uppercase">
                  Low Stock
                </p>
                {lowStockCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {lowStockCount}
              </h3>
            </div>
            <div
              onClick={() => setStockFilter("out")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${stockFilter === "out" ? "bg-red-50 border-red-200 shadow-md ring-1 ring-red-500/20" : "bg-white border-gray-200 hover:bg-red-50/50"}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-600 font-semibold uppercase">
                  Out of Stock
                </p>
                {outOfStockCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {outOfStockCount}
              </h3>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col gap-3 justify-center">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none cursor-pointer"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {getCategoryDetails.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock Status</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productDetails
                  .filter((product) => {
                    const matchesSearch = product.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                    const matchesCategory = filterCategory
                      ? product.category_id == filterCategory
                      : true;
                    // Stock Filter
                    let matchesStock = true;
                    if (stockFilter === "low")
                      matchesStock =
                        product.quantity > 0 && product.quantity < 10;
                    if (stockFilter === "out")
                      matchesStock = product.quantity === 0;

                    return matchesSearch && matchesCategory && matchesStock;
                  })
                  .map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={
                                  product.image_url.startsWith("http")
                                    ? product.image_url
                                    : `https://grocery-ai.onrender.com/${product.image_url}`
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹{product.price}
                      </td>
                      <td className="px-6 py-4">
                        {product.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <AlertTriangle size={12} /> Out of Stock
                          </span>
                        ) : product.quantity < 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            <AlertTriangle size={12} /> Low Stock (
                            {product.quantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={12} /> In Stock (
                            {product.quantity})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p
                          className="text-sm text-gray-600 line-clamp-1"
                          title={product.description}
                        >
                          {product.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setCurrentEditId(product.id);
                              setProductName(product.name);
                              setProductPrice(product.price);
                              setProductQuantity(product.quantity);
                              setProductDescription(product.description);
                              setProductCategory(product.category_id || "");
                              setProductSubCategory(
                                product.subcategory_id || "",
                              );
                              setProductImage(null);
                              setPreviewImage(
                                product.image_url.startsWith("http")
                                  ? product.image_url
                                  : `https://grocery-ai.onrender.com/${product.image_url}`,
                              );
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              productDelete(product._id || product.id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {productDetails.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center opacity-60">
                        <Package size={32} className="mb-2" />
                        <p>No products found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {isAdding ? "Add New Product" : "Edit Product"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form
                onSubmit={
                  isAdding
                    ? handleAddProduct
                    : (e) => handlEditProduct(e, currentEditId)
                }
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    placeholder="e.g. Organic Bananas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {getCategoryDetails.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SubCategory
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                      value={productSubCategory}
                      onChange={(e) => setProductSubCategory(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {getSubCategoryDetails.map((sub) => (
                        <option
                          key={sub.subcategory_id}
                          value={sub.subcategory_id}
                        >
                          {sub.subcategory_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <div className="border border-gray-200 border-dashed rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative text-center">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const newFile = e.target.files[0];
                        if (newFile) {
                          setProductImage(newFile);
                          setPreviewImage(URL.createObjectURL(newFile));
                        }
                      }}
                      required={isAdding}
                    />
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 mx-auto object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                        <ImageIcon className="mb-2" />
                        <span className="text-xs">
                          Click or drop image here
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    rows="3"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-95"
                  >
                    {isAdding ? "Create Product" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduct;
