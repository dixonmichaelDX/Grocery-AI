import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingBag,
  FaTruck,
  FaHeadset,
  FaShieldAlt,
  FaUndo,
  FaArrowRight,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCog,
  FaToggleOn,
  FaToggleOff,
  FaRobot,
  FaStar,
  FaRegStar,
  FaCommentDots,
} from "react-icons/fa";
import { X } from "lucide-react";
import NavBar from "../NavBar";
import AIProfileSection from "../customer/AIProfileSection";
import AIRecommendationGrid from "../customer/AIRecommendationGrid";

const Home = ({ setViewMoreDetails }) => {
  /* State for Side-by-Side Category Navigation */
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  // const [showSubcategory, setShowSubcategory] = useState(false); // Removed for split-view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [totalCartCount, setTotalCartCount] = useState(0);
  const navigate = useNavigate();

  // AI Features State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const baseUrl = "https://grocery-ai.onrender.com";

  // Featured Product State
  const [featuredProduct, setFeaturedProduct] = useState(null);

  // AI Preferences State
  const [aiPreferences, setAiPreferences] = useState(null);

  // Load AI Preferences
  useEffect(() => {
    const loadPreferences = () => {
      const savedData = localStorage.getItem("userAIPreferences");
      if (savedData) {
        setAiPreferences(JSON.parse(savedData));
      }
    };

    loadPreferences();

    // Listen for updates from AIProfileSection
    window.addEventListener("aiPreferencesUpdated", loadPreferences);
    return () =>
      window.removeEventListener("aiPreferencesUpdated", loadPreferences);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Products
        const prodRes = await axios.get(`${baseUrl}/api/products/`);
        setProducts(prodRes.data.products);

        // Find Featured Product (Weekly Fresh Basket)
        // If not found in initial list (due to pagination), fetch it explicitly
        let weeklyBasket = prodRes.data.products.find(
          (p) => p.name === "Weekly Fresh Basket",
        );

        if (!weeklyBasket) {
          try {
            const searchRes = await axios.get(
              `${baseUrl}/api/products?search=Weekly Fresh Basket`,
            );
            if (searchRes.data.products && searchRes.data.products.length > 0) {
              weeklyBasket = searchRes.data.products[0];
            }
          } catch (ignore) {}
        }

        if (weeklyBasket) setFeaturedProduct(weeklyBasket);

        // 2. Fetch Categories
        const catRes = await axios.get(`${baseUrl}/api/category`);
        setCategory(catRes.data);

        // 3. Default Select First Category if available
        if (catRes.data && catRes.data.length > 0) {
          const firstCatId = catRes.data[0].id; // Ensure API returns 'id'
          setActiveCategoryId(firstCatId);

          // Fetch subcategories for the first category immediately
          const subRes = await axios.get(
            `${baseUrl}/api/subcategories/category/${firstCatId}`,
          );
          setSubCategories(subRes.data);
        }
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    fetchData();
  }, [totalCartCount]);

  // ... (keep existing cart fetch useEffect) ...
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${baseUrl}/api/cart`, {
          headers: { Authorization: token },
        })
        .then((res) => {
          setTotalCartCount(res.data.length || 0);
          console.log("Updated totalCartCount in App:", res.data.length);
        })
        .catch((err) => {
          console.error("Failed to fetch cart count in App:", err);
        });
    }
  }, []);

  const [headerTitle, setHeaderTitle] = useState("Featured Products");
  const [headerDesc, setHeaderDesc] = useState(
    "Best quality fresh picks for your kitchen",
  );

  // Handle Add to Cart
  const handleAddToCart = async (product_id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart.");
      navigate("/grocery/login");
      return;
    }

    try {
      await axios.post(
        `${baseUrl}/api/cart/add`,
        { product_id, quantity: 1 },
        { headers: { Authorization: token } },
      );

      alert("Item added to cart!");

      // Refresh cart count
      const res = await axios.get(`${baseUrl}/api/cart`, {
        headers: { Authorization: token },
      });
      setTotalCartCount(res.data.length || 0);
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Try again.");
    }
  };

  // Handle Search from NavBar
  const handleSearch = async (searchTerm) => {
    try {
      if (!searchTerm) {
        setFilteredProducts(null); // Reset to show all/default
        return;
      }

      const res = await axios.get(
        `${baseUrl}/api/products?search=${searchTerm}`,
      );
      if (res.data && res.data.products) {
        setFilteredProducts(res.data.products);
        // Ensure pagination works or reset it
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  // Handle Main Category Click (Side updates)
  const handleCategoryClick = async (id) => {
    try {
      if (id === activeCategoryId) return;

      setActiveCategoryId(id);

      // Fetch subcategories for selected category
      const res = await axios.get(
        `${baseUrl}/api/subcategories/category/${id}`,
      );
      setSubCategories(res.data);
    } catch (err) {
      console.log("Subcategory fetch failed:", err);
    }
  };

  const handleSubCategoryClick = async (subCatId, subCatName) => {
    try {
      console.log("Click SubCat:", subCatName, "ID:", subCatId);
      const res = await axios.get(
        `${baseUrl}/api/products?subcategory=${subCatId}`,
      );
      console.log("SubCat API Response:", res.data);
      setFilteredProducts(res.data.products);
      // Keep subcategories visible so user can switch between them
      setHeaderTitle(subCatName); // Set title to subcategory name
      setHeaderDesc(`Found ${res.data.products.length} items in ${subCatName}`);
      setCurrentPage(1);
    } catch (err) {
      console.log("Subcategory product fetch failed:", err);
    }
  };

  const handleUserVm = (itemId) => {
    const safeFiltered = filteredProducts || [];
    const selectedItem = [...products, ...safeFiltered].find(
      (product) => product.id === itemId,
    );
    if (selectedItem) {
      navigate("/grocery/home/viewmore", { state: selectedItem });
    }
  };

  const paginate = (items) => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  // Logic to apply AI Filter
  let finalProducts = filteredProducts !== null ? filteredProducts : products;

  // Real AI logic simulation

  // Real AI logic simulation
  if (showAIRecommendations) {
    if (!aiPreferences) {
      // If no preferences set, just show everything or default set
      // But usually we might want to prompt user. For now, we fallback to original "smart" filter or just NO filter?
      // Let's keep a basic filter if no prefs:
      // finalProducts = finalProducts;
    } else {
      const { preferences, allergies } = aiPreferences;

      finalProducts = finalProducts.filter((item) => {
        const name = item.name.toLowerCase();
        const desc = item.description ? item.description.toLowerCase() : "";
        const text = name + " " + desc;

        // 1. Check Allergies (Exclude)
        if (
          allergies?.peanuts &&
          (text.includes("peanut") || text.includes("groundnut"))
        )
          return false;
        if (
          allergies?.dairy &&
          (text.includes("milk") ||
            text.includes("cheese") ||
            text.includes("butter") ||
            text.includes("ghee") ||
            text.includes("curd") ||
            text.includes("yogurt") ||
            text.includes("paneer") ||
            text.includes("cream"))
        )
          return false;
        if (
          allergies?.soy &&
          (text.includes("soya") ||
            text.includes("soy") ||
            text.includes("tofu"))
        )
          return false;
        // Shellfish usually implies non-veg check, but added explicit if needed (not common in this mock list but good to have)
        if (
          allergies?.shellfish &&
          (text.includes("shrimp") ||
            text.includes("prawn") ||
            text.includes("crab") ||
            text.includes("lobster"))
        )
          return false;

        // 2. Check Dietary Preferences (Strict)
        if (preferences?.vegan) {
          const nonVeganKeywords = [
            "milk",
            "cheese",
            "butter",
            "ghee",
            "curd",
            "honey",
            "chicken",
            "egg",
            "meat",
            "fish",
            "paneer",
            "yogurt",
          ];
          if (nonVeganKeywords.some((kw) => text.includes(kw))) return false;
        }

        if (preferences?.vegetarian && !preferences?.vegan) {
          const nonVegKeywords = [
            "chicken",
            "egg",
            "meat",
            "fish",
            "ham",
            "bacon",
            "prawn",
          ];
          if (nonVegKeywords.some((kw) => text.includes(kw))) return false;
        }

        if (preferences?.glutenFree) {
          const glutenKeywords = [
            "bread",
            "wheat",
            "maida",
            "biscuit",
            "rusk",
            "cake",
            "cookie",
            "bun",
          ];
          if (glutenKeywords.some((kw) => text.includes(kw))) return false;
        }

        if (preferences?.sugarFree) {
          const sugarKeywords = [
            "sugar",
            "sweet",
            "chocolate",
            "candy",
            "jam",
            "ice cream",
            "soda",
            "coke",
          ];
          if (sugarKeywords.some((kw) => text.includes(kw))) return false;
        }

        // 3. High Protein (Include/Boost) - Optional: we could just FILTER to only Show High protein, logic says "Recommendations", so maybe strict?
        // Let's make it strict for "Filter Mode": Must have protein source.
        if (preferences?.highProtein) {
          const proteinKeywords = [
            "chicken",
            "egg",
            "fish",
            "dal",
            "pulse",
            "beans",
            "paneer",
            "soya",
            "milk",
            "almond",
            "nuts",
            "protein",
            "tofu",
          ];
          if (!proteinKeywords.some((kw) => text.includes(kw))) return false;
        }

        if (preferences?.keto) {
          const ketoAvoid = [
            "sugar",
            "bread",
            "rice",
            "potato",
            "pasta",
            "wheat",
            "fruit",
            "cake",
          ]; // Simple Keto avoidance
          if (ketoAvoid.some((kw) => text.includes(kw))) return false;
        }

        return true;
      });
    }
  }

  console.log(
    "Render - FilteredProducts:",
    filteredProducts?.length,
    "FinalProducts:",
    finalProducts.length,
  );

  const displayedProducts = finalProducts;
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

  // Fallback data for featured if API fails or script didn't run
  const featured = featuredProduct || {
    id: null,
    name: "Weekly Fresh Basket",
    description:
      "A curated mix of seasonal vegetables and fruits. Perfect for a healthy family week.",
    price: 499,
    original_price: 699,
    image_url:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
  };

  return (
    <>
      <NavBar cartCount={totalCartCount} onSearch={handleSearch} />

      {/* AI Profile Modal */}
      <AIProfileSection
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* User Feedback Modal & Trigger */}
      <UserFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-300 hover:bg-indigo-700 hover:scale-110 transition-all duration-300 group"
        title="Leave Feedback"
      >
        <FaCommentDots size={24} className="group-hover:animate-pulse" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Feedback
        </span>
      </button>

      <section className="bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: Text content */}
            <div className="space-y-5">
              <div className="flex gap-2 mb-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Fresh Harvest · Daily
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 uppercase tracking-wide animate-pulse">
                  <FaRobot /> AI Powered
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-gray-900">
                Fresh Groceries <br />
                <span className="text-green-600">Delivered to You</span>
              </h1>

              <p className="text-gray-600 text-sm md:text-base max-w-md">
                Experience the freshness of farm-picked vegetables, organic
                fruits, and daily essentials delivered right to your doorstep.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition"
                  onClick={() => setIsProfileOpen(true)}
                >
                  Shop Now <FaArrowRight className="ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex items-center rounded-full border-2 border-indigo-500 px-6 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                >
                  <FaUserCog className="mr-2" /> Customize AI Profile
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 pt-4 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaTruck className="text-green-500" />
                  <span>Free delivery over ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  <span>Freshness Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUndo className="text-green-500" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Stats (compact) */}
              <div className="flex flex-wrap gap-6 pt-3 text-sm">
                <div>
                  <p className="text-lg font-semibold text-gray-900">100%</p>
                  <p className="text-gray-500">Organic</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">24h</p>
                  <p className="text-gray-500">Delivery</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">4.9/5</p>
                  <p className="text-gray-500">Service Rating</p>
                </div>
              </div>
            </div>

            {/* Right: Product highlight card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <img
                  src={featured.image_url}
                  alt={featured.name}
                  className="h-64 md:h-80 w-full object-cover"
                  loading="lazy"
                />

                <div className="p-4 md:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {featured.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Best Seller
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-gray-500 line-clamp-2">
                    {featured.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{featured.price}
                      </p>
                      {featured.original_price && (
                        <p className="text-xs text-gray-500">
                          MRP ₹{featured.original_price}{" "}
                          <span className="text-green-600 font-semibold">
                            · Save Big
                          </span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        featured.id
                          ? handleAddToCart(featured.id)
                          : alert("Product loading or unavailable")
                      }
                      className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-xs md:text-sm font-semibold text-gray-800 hover:bg-gray-100 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: AI Recommendation Grid */}
      <AIRecommendationGrid onAddToCart={handleAddToCart} />

      {/* category - Side-by-Side Layout */}
      <section className="py-14 bg-white" id="departments">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shop by Department
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Explore our wide range of fresh produce, dairy, bakery, and pantry
              staples.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* LEFT: Categories (Vertical List) */}
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Categories</h3>
                </div>
                <div className="flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar">
                  {category.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`flex items-center gap-3 px-5 py-3 text-left transition-colors border-l-4 ${
                        // Assuming we verify active state by ID comparison later,
                        // but for now we need a state to track it.
                        // I will add 'activeCategoryId' state in the next step.
                        // Using inline style or simple logic for now won't work perfectly without the state update.
                        // I'll add the className logic here assuming 'activeCategoryId' exists (it will be added in top-level refactor).
                        activeCategoryId === cat.id
                          ? "bg-green-50 border-green-500 text-green-700 font-medium"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm">{cat.name}</span>
                      {activeCategoryId === cat.id && (
                        <FaArrowRight className="ml-auto text-xs opacity-60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Subcategories (Grid) */}
            <div className="w-full lg:w-3/4">
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 h-full min-h-[400px]">
                {subCategories.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        {category.find((c) => c.id === activeCategoryId)
                          ?.name || "Subcategories"}
                      </h3>
                      <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-500">
                        {subCategories.length} items
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {subCategories.map((sub, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleSubCategoryClick(
                              sub.subcategory_id,
                              sub.subcategory_name,
                            )
                          }
                          className="group flex flex-col bg-white rounded-xl border border-gray-200 p-2 hover:shadow-md hover:border-green-300 transition-all text-center"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3 relative">
                            <img
                              src={sub.image_url}
                              alt={sub.subcategory_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 line-clamp-2 px-1">
                            {sub.subcategory_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <FaShoppingBag className="text-4xl mb-3 opacity-20" />
                    <p>Select a category to view items</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {headerTitle}
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                {headerDesc} ·{" "}
                <span className="font-semibold text-gray-800">
                  {displayedProducts?.length || 0} items
                </span>
              </p>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  showAIRecommendations
                    ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-600"
                }`}
              >
                {showAIRecommendations ? (
                  <FaToggleOn size={24} />
                ) : (
                  <FaToggleOff size={24} />
                )}
                <span className="text-sm font-semibold">
                  {showAIRecommendations
                    ? "AI Recommendations On"
                    : "Show AI Recommendations"}
                </span>
              </button>

              <button className="inline-flex items-center self-start md:self-auto text-green-600 text-sm font-medium hover:text-green-700 transition">
                View All <FaArrowRight className="ml-2 text-xs" />
              </button>
            </div>
          </div>

          {/* Product grid (API + map) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginate(displayedProducts).map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Image area */}
                <div className="relative overflow-hidden rounded-2xl rounded-b-none">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-56 md:h-60 object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Top-left badge */}
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-800 shadow">
                    Fresh
                  </span>

                  {/* Wishlist icon */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:text-red-500 hover:bg-white transition"
                  >
                    <FaHeart className="text-xs" />
                  </button>

                  {/* Hover overlay + View Details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    type="button"
                    onClick={() => handleUserVm(item.id)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 inline-flex items-center rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow hover:bg-white transition-all"
                  >
                    View Details
                    <FaArrowRight className="ml-1 text-[10px]" />
                  </button>
                </div>

                {/* Info area */}
                <div className="p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.name}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-base font-bold text-green-600">
                        ₹ {item.price}
                      </p>
                      {item?.original_price && (
                        <p className="text-[11px] text-gray-400 line-through">
                          ₹ {item.original_price}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.id);
                      }}
                      className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1.5 text-[11px] font-semibold text-gray-800 hover:bg-gray-100 transition"
                    >
                      <FaShoppingBag className="mr-1 text-[10px]" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paginate(displayedProducts).length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-sm py-10">
                {showAIRecommendations
                  ? "No AI recommendations match your profile for this section."
                  : "No products found."}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <button
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li key={i}>
                    <button
                      className={`px-3.5 py-1.5 text-xs border rounded-full ${
                        currentPage === i + 1
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-green-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Free Shipping */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FaTruck className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Free Shipping
              </h3>
              <p className="text-gray-500 text-sm">On orders over ₹499</p>
            </div>

            {/* Freshness */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-white border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FaShoppingBag className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Freshness Guaranteed
              </h3>
              <p className="text-gray-500 text-sm">Farm fresh quality</p>
            </div>

            {/* Secure Payment */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FaShieldAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Secure Payment
              </h3>
              <p className="text-gray-500 text-sm">100% secure checkout</p>
            </div>

            {/* Support */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <FaHeadset className="text-orange-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
              <p className="text-gray-500 text-sm">Dedicated support</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand / About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  Fresh<span className="text-green-400">Mart</span>
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Your daily destination for fresh vegetables, fruits, and
                groceries at best prices.
              </p>
              <div className="flex space-x-4">
                <p
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition"
                >
                  <FaFacebookF className="text-xl" />
                </p>
                <p
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition"
                >
                  <FaTwitter className="text-xl" />
                </p>
                <p
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition"
                >
                  <FaInstagram className="text-xl" />
                </p>
                <p
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition"
                >
                  <FaPinterestP className="text-xl" />
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Home
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Shop
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    About Us
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Contact
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Blog
                  </p>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-semibold mb-4">
                Customer Service
              </h4>
              <ul className="space-y-2">
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    FAQ
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Shipping Info
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Returns
                  </p>
                </li>
                <li>
                  <p
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Track Order
                  </p>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Bangalore, India
                </li>
                <li className="flex items-center">
                  <FaPhoneAlt className="mr-2" />
                  +91 9945652745
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-2" />
                  dixonmichael@gmail.com
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 FreshMart. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-500 text-sm">Visa</span>
              <span className="text-gray-500 text-sm">Mastercard</span>
              <span className="text-gray-500 text-sm">PayPal</span>
              <span className="text-gray-500 text-sm">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

const UserFeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("General");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(0);
        setComment("");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaCommentDots /> Your Feedback Needed
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FaStar className="text-green-500 text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Thank You!
              </h4>
              <p className="text-gray-500">Your feedback helps us improve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Rating */}
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  How was your experience?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {star <= (hoverRating || rating) ? (
                        <FaStar className="text-yellow-400 drop-shadow-sm" />
                      ) : (
                        <FaRegStar className="text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-indigo-500 font-medium h-4">
                  {rating === 1 && "Terrible"}
                  {rating === 2 && "Bad"}
                  {rating === 3 && "Okay"}
                  {rating === 4 && "Good"}
                  {rating === 5 && "Excellent!"}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Type
                </label>
                <div className="flex gap-2">
                  {["General", "Bug", "Feature", "Other"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        category === cat
                          ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                  rows="3"
                  placeholder="Tell us what you think..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
