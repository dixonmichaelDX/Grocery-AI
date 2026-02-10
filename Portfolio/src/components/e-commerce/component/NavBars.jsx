import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaBars, FaShoppingBag, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';

const NavBars = () => {
    const [tokens, setTokens] = useState()
    const [open, setOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const [totalCartCount, setTotalCartCount] = useState(0);

    // const toggleMobileMenu = () => {
    //     setIsMobileMenuOpen((prev) => !prev);
    // };
    const logoutButton = () => {
        localStorage.removeItem("token");
        navigate("/grocery");
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        setTokens(token)
        if (token) {
            axios
                .get("https://grocerybackend-1-fwcd.onrender.com/api/cart", {
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

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div onClick={() => navigate("/grocery/home")} className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">F</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                            Fresh<span className="text-green-600">Mart</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">

                    </nav>



                    {/* Icons */}
                    <div className="flex items-center space-x-4">

                        {/* Cart */}
                        <button onClick={() => navigate("/grocery/grocery/home/cart")} className="text-gray-600 hover:text-blue-600 transition relative">
                            <FaShoppingBag className="text-xl" />
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {totalCartCount}
                            </span>
                        </button>

                        {/* User menu wrapper (IMPORTANT) */}
                        <div className="relative">
                            <button
                                onClick={() => setOpen(!open)}
                                className="text-gray-600 hover:text-blue-600 transition"
                            >
                                <FaUser className="text-xl" />
                            </button>
                            {
                                tokens ? (open && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                                        <ul className="py-2 text-sm text-gray-700">
                                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                                            <li onClick={() => navigate("/grocery/home/order-history")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">OrderHistory</li>
                                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => logoutButton()}>Logout</li>
                                        </ul>
                                    </div>
                                )) : (
                                    open && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                                            <ul className="py-2 text-sm text-gray-700">
                                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { navigate("ecommerce/login") }}>Login</li>
                                            </ul>
                                        </div>
                                    )
                                )
                            }

                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FaBars className="text-xl" />
                        </button>

                    </div>

                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
                    <p onClick={() => navigate("/grocery/home")} className="block text-gray-700 font-medium">Home</p>
                    <p className="block text-gray-700 font-medium">Profile</p>
                    <p onClick={() => navigate("/grocery/home/order-history")} className="block text-gray-700 font-medium">OrderHistory</p>
                    {/* <p href="#" className="block text-gray-700 font-medium">About</p> */}

                </div>
            )}
        </header>
    )
}

export default NavBars
