import React, { useState, useEffect } from 'react';
import { FaMagic, FaShoppingCart, FaInfoCircle, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Placeholder data since API might not be fully populated with AI recommendations yet
const MOCK_RECOMMENDATIONS = [
    {
        id: '695d1eda6892e666991901a5', // Real DB ID for Avocado
        name: "Fresh Avocados",
        price: 349,
        image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=2575&auto=format&fit=crop",
        reason: "Matches your Keto diet preference",
        matchScore: 98
    },
    {
        id: '695d1dedc3594e1dab506d07', // Real DB ID for Almond Milk
        name: "Almond Milk Unsweetened",
        price: 250,
        image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=2565&auto=format&fit=crop",
        reason: "Popular in Vegan community",
        matchScore: 95
    },
    {
        id: '695d1eda6892e666991901a6', // Real DB ID for Quinoa
        name: "Quinoa Supergrain",
        price: 450,
        image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2670&auto=format&fit=crop",
        reason: "High protein alternative",
        matchScore: 92
    }
];

const AIRecommendationGrid = ({ onAddToCart }) => {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate AI processing delay
        const timer = setTimeout(() => {
            setRecommendations(MOCK_RECOMMENDATIONS);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        // Simulate refreshing logic
        setTimeout(() => {
            // Just shuffling mock data for demo effect
            const shuffled = [...MOCK_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled);
            setLoading(false);
        }, 1200);
    };

    return (
        <section className="bg-gradient-to-b from-indigo-50 to-white py-12 border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                            <FaMagic /> AI Powered
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Picked Just For You
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Personalized suggestions based on your profile and history.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-2"
                    >
                        ⟳ Refresh Suggestions
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendations.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 relative"
                            >
                                {/* AI Reason Badge */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                                        <FaStar className="text-yellow-300" /> {item.reason}
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-xl bg-gray-100 mb-3">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-indigo-900 shadow-sm">
                                        {item.matchScore}% Match
                                    </div>
                                </div>

                                <div className="px-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                                        <p className="font-bold text-green-600">₹{item.price}</p>
                                    </div>

                                    <button
                                        onClick={() => onAddToCart && onAddToCart(item.id)}
                                        className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaShoppingCart /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
};

export default AIRecommendationGrid;
