import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import adminCatCss from "./adminCategory.module.css";
import axios from "axios";
import {
  Home,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

const AdminCategory = () => {
  const navigate = useNavigate();

  const [isCatEditOpen, setIsCatEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [adminCatName, setAdminCatName] = useState("");
  const [adminCatImg, setAdminCatImg] = useState("");
  const [catEditName, setCatEditName] = useState("");
  const [catEditImg, setCatEditImg] = useState(null);
  const [catId, setCatId] = useState();
  const token = localStorage.getItem("token");

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://grocery-ai.onrender.com/api/category",
        {
          headers: { Authorization: token },
        },
      );
      setCategoryDetails(response.data);
    } catch (error) {
      console.log("error", error);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Add new category
  const handleAdminCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", adminCatName);
    formData.append("image", adminCatImg);
    try {
      await axios.post(
        "https://grocery-ai.onrender.com/api/category/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        },
      );
      alert("Category is added");
      closeModal();
      await fetchCategories(); // Refetch after add
    } catch (error) {
      console.log(error, "error");
    }
  };

  // Edit category
  const handleEditCat = async () => {
    const formData = new FormData();
    formData.append("name", catEditName);
    if (catEditImg) {
      formData.append("image", catEditImg);
    }
    try {
      await axios.put(
        `https://grocery-ai.onrender.com/api/category/${catId}`,
        formData,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setIsCatEditOpen(false);
      await fetchCategories(); // Refetch after edit
    } catch (error) {
      console.log("catEditError", error);
    }
  };

  // Delete category
  const handleDeleteCat = async (catDelId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `https://grocery-ai.onrender.com/api/category/${catDelId}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        await fetchCategories(); // Refetch after delete
      } catch (error) {
        console.log("error delete category", error);
      }
    }
  };

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  const handleCloseModal = () => {
    setIsCatEditOpen(false);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCatEditOpen(false);
    setAdminCatName("");
    setAdminCatImg("");
  };

  const handleEditClick = (id) => {
    const cat = categoryDetails.find((item) => item.id === id);
    if (cat) {
      setCatId(id);
      setCatEditName(cat.name);
      setCatEditImg(null); // reset file input
      setIsCatEditOpen(true);
    }
  };

  return (
    <div className={adminCatCss.adminContainer}>
      <div className={adminCatCss.headerSection}>
        <div className={adminCatCss.pageTitle}>
          <h1>Category Management</h1>
          <span className={adminCatCss.breadcrumb}>
            Dashboard &gt; Categories
          </span>
        </div>

        <div className={adminCatCss.actionButtons}>
          <button
            className={adminCatCss.navBtn}
            onClick={() => navigate("/grocery/admin")}
          >
            <Home size={18} />
            Dashboard
          </button>

          <button
            className={`${adminCatCss.navBtn} ${adminCatCss.addBtn}`}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Category
          </button>

          <button
            onClick={logoutButton}
            className={`${adminCatCss.navBtn} ${adminCatCss.logout}`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className={adminCatCss.tableContainer}>
        <div className={adminCatCss.tableWrapper}>
          <table className={adminCatCss.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryDetails.length > 0 ? (
                categoryDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={adminCatCss.rowImage}
                        />
                      ) : (
                        <div className={adminCatCss.imagePlaceholder}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <div className={adminCatCss.catActions}>
                        <button
                          onClick={() => handleEditClick(item.id)}
                          className={`${adminCatCss.iconBtn} ${adminCatCss.editBtn}`}
                          title="Edit Category"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(item.id)}
                          className={`${adminCatCss.iconBtn} ${adminCatCss.deleteBtn}`}
                          title="Delete Category"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div
          className={adminCatCss.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={adminCatCss.modalContainer}>
            <div className={adminCatCss.modalHeader}>
              <h3>Add New Category</h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdminCategory}>
              <div className={adminCatCss.formGroup}>
                <label>Category Name</label>
                <input
                  type="text"
                  className={adminCatCss.input}
                  placeholder="Enter category name..."
                  onChange={(e) => setAdminCatName(e.target.value)}
                  required
                />
              </div>

              <div className={adminCatCss.formGroup}>
                <label>Category Image</label>
                <label className={adminCatCss.fileInputWrapper}>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setAdminCatImg(e.target.files[0])}
                    required
                  />
                  <ImageIcon
                    size={32}
                    style={{
                      color: "var(--primary-color)",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div>
                    {adminCatImg ? adminCatImg.name : "Click to upload image"}
                  </div>
                </label>
              </div>

              <div className={adminCatCss.modalActions}>
                <button
                  type="button"
                  className={adminCatCss.cancelBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className={adminCatCss.saveBtn}>
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isCatEditOpen && (
        <div
          className={adminCatCss.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className={adminCatCss.modalContainer}>
            <div className={adminCatCss.modalHeader}>
              <h3>Edit Category</h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditCat();
              }}
            >
              <div className={adminCatCss.formGroup}>
                <label>Category Name</label>
                <input
                  type="text"
                  className={adminCatCss.input}
                  value={catEditName}
                  onChange={(e) => setCatEditName(e.target.value)}
                  required
                />
              </div>

              <div className={adminCatCss.formGroup}>
                <label>New Image (Leave empty to keep current)</label>
                <label className={adminCatCss.fileInputWrapper}>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setCatEditImg(e.target.files[0])}
                  />
                  <ImageIcon
                    size={32}
                    style={{
                      color: "var(--primary-color)",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div>
                    {catEditImg ? catEditImg.name : "Click to upload new image"}
                  </div>
                </label>
              </div>

              <div className={adminCatCss.modalActions}>
                <button
                  type="button"
                  className={adminCatCss.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className={adminCatCss.saveBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategory;
