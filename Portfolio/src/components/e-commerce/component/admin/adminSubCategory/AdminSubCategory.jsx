import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import adminSubCatCss from "./adminSubCategory.module.css";
import axios from "axios";
import {
  Home,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

const AdminSubCategory = () => {
  const navigate = useNavigate();
  const [isSubCatEditOpen, setIsSubCatEditOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [name, setName] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const [categoryMain, setCategoryMain] = useState("");
  const [images, setImages] = useState("");
  const token = localStorage.getItem("token");
  const [getSubCategoryDetails, setSubGetCategoryDetails] = useState([]);
  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [subCatEditName, setSubCatEditName] = useState();
  const [subCatEditImg, setSubCatEditImg] = useState();
  const [catGetName, setCatGetName] = useState();
  const [editCategoryId, setEditCategoryId] = useState("");

  const fetchSubCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://grocery-ai.onrender.com/api/subcategories",
      );
      const responseCat = await axios.get(
        "https://grocery-ai.onrender.com/api/category",
        {
          headers: { Authorization: token },
        },
      );
      setGetCategoryDetails(responseCat.data);
      setSubGetCategoryDetails(response.data);
    } catch (error) {
      console.log("Fetch category error", error);
    }
  }, [token]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  //add subcat
  const handleSubCatDetails = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", categoryMain);
    formData.append("image", images);

    try {
      await axios.post(
        "https://grocery-ai.onrender.com/api/subcategories/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        },
      );
      alert("Subcategory added successfully");
      fetchSubCategories();
      closeModal();
    } catch (error) {
      console.log("error", error);
    }
  };

  // subcat edit
  const handleEditSubCat = async () => {
    const finalCategoryId =
      editCategoryId ||
      getCategoryDetails.find((cat) => cat.name === catGetName)?.id;

    const catId = finalCategoryId;

    const formData = new FormData();
    formData.append("name", subCatEditName);
    formData.append("category_id", catId);
    if (subCatEditImg) {
      formData.append("image", subCatEditImg);
    }

    try {
      await axios.put(
        `https://grocery-ai.onrender.com/api/subcategories/${subCatId}`,
        formData,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      fetchSubCategories();
      setIsSubCatEditOpen(false);
    } catch (error) {
      console.log("catEditError", error);
    }
  };

  const handleEditClick = (id) => {
    const subCat = getSubCategoryDetails.find(
      (item) => item.subcategory_id === id,
    );
    if (subCat) {
      setSubCatId(id);
      setSubCatEditName(subCat.subcategory_name);
      setCatGetName(subCat.category_name);
      setSubCatEditImg(null);
      setIsSubCatEditOpen(true);
    }
  };

  // delete
  const handleDeleteCat = async (subCatDelId) => {
    if (window.confirm("Are you sure you want to delete this sub-category?")) {
      try {
        await axios.delete(
          `https://grocery-ai.onrender.com/api/subcategories/${subCatDelId}`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        fetchSubCategories();
      } catch (error) {
        console.log("error delete category", error);
      }
    }
  };

  const closeModal = () => {
    setIsSetOpen(false);
    setName("");
    setCategoryMain("");
    setImages("");
  };

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery");
  };

  return (
    <div className={adminSubCatCss.adminContainer}>
      <div className={adminSubCatCss.headerSection}>
        <div className={adminSubCatCss.pageTitle}>
          <h1>Sub-Category Management</h1>
          <span className={adminSubCatCss.breadcrumb}>
            Dashboard &gt; Sub-Categories
          </span>
        </div>

        <div className={adminSubCatCss.actionButtons}>
          <button
            className={adminSubCatCss.navBtn}
            onClick={() => navigate("/grocery/admin")}
          >
            <Home size={18} />
            Dashboard
          </button>

          <button
            className={`${adminSubCatCss.navBtn} ${adminSubCatCss.addBtn}`}
            onClick={() => setIsSetOpen(true)}
          >
            <Plus size={18} />
            Add Sub-Category
          </button>

          <button
            onClick={logoutButton}
            className={`${adminSubCatCss.navBtn} ${adminSubCatCss.logout}`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <Outlet />

      <div className={adminSubCatCss.tableContainer}>
        <div className={adminSubCatCss.tableWrapper}>
          <table className={adminSubCatCss.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Sub-Category Name</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSubCategoryDetails.length > 0 ? (
                getSubCategoryDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.category_name}</td>
                    <td>
                      <strong>{item.subcategory_name}</strong>
                    </td>
                    <td>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt="loading"
                          className={adminSubCatCss.rowImage}
                        />
                      ) : (
                        <div className={adminSubCatCss.imagePlaceholder}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className={adminSubCatCss.catActions}>
                        <button
                          onClick={() => handleEditClick(item.subcategory_id)}
                          className={`${adminSubCatCss.iconBtn} ${adminSubCatCss.editBtn}`}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCat(item.subcategory_id)}
                          className={`${adminSubCatCss.iconBtn} ${adminSubCatCss.deleteBtn}`}
                          title="Delete"
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
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    No Sub-Categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isSetOpen && (
        <div
          className={adminSubCatCss.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={adminSubCatCss.modalContainer}>
            <div className={adminSubCatCss.modalHeader}>
              <h3>Add New Sub-Category</h3>
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

            <form onSubmit={handleSubCatDetails}>
              <div className={adminSubCatCss.formGroup}>
                <label>Category</label>
                <select
                  className={adminSubCatCss.select}
                  onChange={(e) => setCategoryMain(e.target.value)}
                  required
                >
                  <option value="" disabled selected>
                    Select Category
                  </option>
                  {getCategoryDetails.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={adminSubCatCss.formGroup}>
                <label>Sub-Category Name</label>
                <input
                  type="text"
                  className={adminSubCatCss.input}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  required
                />
              </div>

              <div className={adminSubCatCss.formGroup}>
                <label>Image</label>
                <label className={adminSubCatCss.fileInputWrapper}>
                  <input
                    onChange={(e) => {
                      setImages(e.target.files[0]);
                    }}
                    type="file"
                    style={{ display: "none" }}
                    required
                  />
                  <ImageIcon
                    size={32}
                    style={{
                      color: "var(--primary-color)",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div>{images ? images.name : "Click to upload image"}</div>
                </label>
              </div>

              <div className={adminSubCatCss.modalActions}>
                <button
                  type="button"
                  className={adminSubCatCss.cancelBtn}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className={adminSubCatCss.saveBtn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isSubCatEditOpen && (
        <div
          className={adminSubCatCss.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSubCatEditOpen(false);
          }}
        >
          <div className={adminSubCatCss.modalContainer}>
            <div className={adminSubCatCss.modalHeader}>
              <h3>Edit Sub-Category</h3>
              <button
                onClick={() => setIsSubCatEditOpen(false)}
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
                handleEditSubCat();
              }}
            >
              <div className={adminSubCatCss.formGroup}>
                <label>Category</label>
                <select
                  className={adminSubCatCss.select}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                >
                  <option selected disabled>
                    {catGetName} (Current)
                  </option>
                  {getCategoryDetails.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={adminSubCatCss.formGroup}>
                <label>Sub-Category Name</label>
                <input
                  type="text"
                  className={adminSubCatCss.input}
                  value={subCatEditName}
                  onChange={(e) => setSubCatEditName(e.target.value)}
                  required
                />
              </div>

              <div className={adminSubCatCss.formGroup}>
                <label>New Image (optional)</label>
                <label className={adminSubCatCss.fileInputWrapper}>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setSubCatEditImg(e.target.files[0])}
                  />
                  <ImageIcon
                    size={32}
                    style={{
                      color: "var(--primary-color)",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div>
                    {subCatEditImg
                      ? subCatEditImg.name
                      : "Click to upload new image"}
                  </div>
                </label>
              </div>

              <div className={adminSubCatCss.modalActions}>
                <button
                  type="button"
                  className={adminSubCatCss.cancelBtn}
                  onClick={() => {
                    setIsSubCatEditOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={adminSubCatCss.saveBtn}>
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

export default AdminSubCategory;
