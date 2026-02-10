import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaRobot, FaLeaf, FaAllergies, FaWallet } from 'react-icons/fa';

const AIProfileSection = ({ isOpen, onClose }) => {
    const [preferences, setPreferences] = useState({
        vegan: false,
        glutenFree: false,
        sugarFree: false,
        highProtein: false,
        keto: false,
    });

    const [allergies, setAllergies] = useState({
        peanuts: false,
        dairy: false,
        soy: false,
        shellfish: false,
    });

    const [budget, setBudget] = useState(2000);
    const [loading, setLoading] = useState(false);

    // 🔄 Load from LocalStorage on Mount
    useEffect(() => {
        const savedData = localStorage.getItem('userAIPreferences');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.preferences) setPreferences(parsed.preferences);
            if (parsed.allergies) setAllergies(parsed.allergies);
            if (parsed.budget) setBudget(parsed.budget);
        }
    }, []);

    const handlePrefChange = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAllergyChange = (key) => {
        setAllergies(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setLoading(true);

        // Save to LocalStorage
        const profileData = { preferences, allergies, budget };
        localStorage.setItem('userAIPreferences', JSON.stringify(profileData));

        // Dispatch Event to notify Home.jsx immediately
        window.dispatchEvent(new Event('aiPreferencesUpdated'));

        setTimeout(() => {
            setLoading(false);
            onClose();
            alert("AI Profile updated! Recommendations will now be personalized.");
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FaRobot className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">My AI Profile</h2>
                            <p className="text-indigo-100 text-xs">Personalize your shopping experience</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Diet Section */}
                    <div>
                        <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                            <FaLeaf className="text-green-500" /> Dietary Preferences
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(preferences).map(key => (
                                <label key={key} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${preferences[key] ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input
                                        type="checkbox"
                                        checked={preferences[key]}
                                        onChange={() => handlePrefChange(key)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Allergies Section */}
                    <div>
                        <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                            <FaAllergies className="text-red-500" /> Allergies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(allergies).map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleAllergyChange(key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${allergies[key]
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                        }`}
                                >
                                    {allergies[key] ? '🚫 ' : ''} {key.charAt(0).toUpperCase() + key.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div>
                        <h3 className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                            <FaWallet className="text-blue-500" /> Monthly Grocery Budget
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-500 text-sm">Range</span>
                                <span className="text-2xl font-bold text-gray-900">₹{budget}</span>
                            </div>
                            <input
                                type="range"
                                min="500"
                                max="10000"
                                step="500"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>₹500</span>
                                <span>₹10,000+</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <FaSave /> Save Preferences
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIProfileSection;
