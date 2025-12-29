import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";

const OPTIONS = {
    cuisines: [
        'Afghan', 'Afghani', 'African', 'American', 'Andhra', 'Arabian', 'Asian', 'Assamese', 'Australian', 'Awadhi', 'BBQ', 'Belgian',
        'Bengali', 'Bihari', 'Bohri', 'British', 'Burmese', 'Cantonese', 'Chettinad', 'Chinese', 'Continental', 'European', 'French',
        'German', 'Goan', 'Greek', 'Grill', 'Gujarati', 'Hyderabadi', 'Indonesian', 'Iranian', 'Italian', 'Japanese', 'Jewish',
        'Kashmiri', 'Kerala', 'Konkan', 'Korean', 'Lebanese', 'Lucknowi', 'Maharashtrian', 'Malaysian', 'Mangalorean', 'Mediterranean',
        'Mexican', 'Middle Eastern', 'Modern Indian', 'Mongolian', 'Mughlai', 'Naga', 'Nepalese', 'North Eastern', 'North Indian',
        'Oriya', 'Pan Asian', 'Parsi', 'Portuguese', 'Rajasthani', 'Russian', 'Sindhi', 'Singaporean', 'South American', 'South Indian',
        'Spanish', 'Sri Lankan', 'Thai', 'Tibetan', 'Turkish', 'Vietnamese', 'None'
    ],
    rest_type: ['Bakery', 'Bar', 'Beverage Shop', 'Bhojanalya', 'Cafe', 'Casual Dining', 'Club', 'Confectionery', 'Delivery', 'Dessert Parlor', 'Dhaba', 'Drinks Only', 'Fast Food', 'Fine Dining', 'Finger Food', 'Food Court', 'Food Truck', 'Irani Cafee', 'Kiosk', 'Lounge', 'Mess', 'Microbrewery', 'Pub', 'Quick bites', 'Sweet Shop', 'Takeaway', 'Tamil', 'None'],
    locations: [
        'Banashankari', 'Basavanagudi', 'Mysore Road', 'Jayanagar', 'Kumaraswamy Layout', 'Rajarajeshwari Nagar', 'Vijay Nagar', 'Uttarahalli', 'JP Nagar', 'South Bangalore', 'City Market', 'Bannerghatta Road', 'BTM', 'Kanakapura Road', 'Bommanahalli', 'Electronic City', 'Sarjapur Road', 'Wilson Garden', 'Shanti Nagar', 'Koramangala 5th Block', 'Richmond Road', 'HSR', 'Koramangala 7th Block', 'Bellandur', 'Marathahalli', 'Whitefield', 'East Bangalore', 'Old Airport Road', 'Indiranagar', 'Koramangala 4th Block', 'Frazer Town', 'MG Road', 'Brigade Road', 'Lavelle Road', 'Church Street', 'Ulsoor', 'Residency Road', 'Shivajinagar', 'Infantry Road', 'St. Marks Road', 'Cunningham Road', 'Race Course Road', 'Commercial Street', 'Vasanth Nagar', 'Domlur', 'Koramangala 8th Block', 'Ejipura', 'Jeevan Bhima Nagar', 'Old Madras Road', 'Seshadripuram', 'Kammanahalli', 'Koramangala 6th Block', 'Majestic', 'Langford Town', 'Central Bangalore', 'Brookefield', 'ITPL Main Road', 'Varthur Main Road', 'Koramangala 2nd Block', 'Koramangala 3rd Block', 'Koramangala 1st Block', 'Koramangala', 'Hosur Road', 'RT Nagar', 'Banaswadi', 'North Bangalore', 'Nagawara', 'Hennur', 'Kalyan Nagar', 'HBR Layout', 'Rammurthy Nagar', 'Thippasandra', 'CV Raman Nagar', 'Kaggadasapura', 'Kengeri', 'Sankey Road', 'Malleshwaram', 'Sanjay Nagar', 'Sadashiv Nagar', 'Basaveshwara Nagar', 'Rajajinagar', 'Yeshwantpur', 'New BEL Road', 'West Bangalore', 'Magadi Road', 'Yelahanka', 'Sahakara Nagar', 'Jalahalli', 'Hebbal', 'Nagarbhavi', 'Peenya', 'KR Puram'
    ]
};

export default function Preferences() {
    const { session } = useAppContext();
    const navigate = useNavigate();

    // UI State
    const [selections, setSelections] = useState({
        cuisines: [],
        rest_type: [],
        dish_pref: "", // Text input now
        budget: 500,
        location: "Koramangala",
    });
    const [readyCount, setReadyCount] = useState(0);
    const [joinedCount, setJoinedCount] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isComputed, setIsComputed] = useState(false);

    // Initial Status Check & WebSocket
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await api.getGroupStatus(session.groupId);
                setReadyCount(status.ready_count);
                setJoinedCount(status.total);

                // Listen for updates
                const unsubReady = wsService.on('USER_READY', (data) => {
                    setReadyCount(data.ready_count);
                });

                const unsubJoined = wsService.on('USER_JOINED', (data) => {
                    setJoinedCount(data.joined_count);
                    setReadyCount(data.ready_count);
                });

                // If backend sent session expired
                const unsubExpired = wsService.on('SESSION_EXPIRED', () => {
                    toast.error("Session Expired!");
                    navigate('/');
                });

                return () => {
                    unsubReady && unsubReady();
                    unsubJoined && unsubJoined();
                    unsubExpired && unsubExpired();
                };
            } catch (err) {
                console.error(err);
            }
        };
        fetchStatus();
    }, [session.groupId, navigate]);

    // ... (rest of the file until the return statement)

    <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <div className="text-4xl font-extrabold text-slate-800">{joinedCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-extrabold text-slate-800">{readyCount}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready</div>
        </div>
    </div>

    const toggleSelection = (category, item) => {
        if (isSubmitted) return;
        setSelections(prev => {
            const current = prev[category];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, [category]: updated };
        });
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitted(true);

            // Parse dishes from text input to list for backend
            const dishesList = selections.dish_pref.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const payload = {
                ...selections,
                dish_pref: dishesList
            };

            await api.submitPreferences(session.groupId, session.userId, payload);
            checkCompute();
        } catch (err) {
            console.error(err);
            setIsSubmitted(false);
            toast.error("Failed to submit");
        }
    };

    const checkCompute = async () => {
        try {
            // Simplified for demo: manual trigger via button usually
        } catch (err) { }
    };

    // Special 'Force Compute' for demo purposes
    const handleCompute = async () => {
        try {
            setIsComputed(true); // Show loading
            await api.computeGroup(session.groupId);
            navigate('/results');
        } catch (err) {
            setIsComputed(false);
            toast.error(err.message);
        }
    };

    return (
        <Background>
            <div className="w-full max-w-[95%] grid md:grid-cols-[1fr_350px] gap-8 items-start">

                {/* Left: Form */}
                <GlassCard className="max-w-full">
                    <div className="space-y-12">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-secondary">What are you craving? 😋</h2>
                            <p className="text-textMuted text-lg">Customize your perfect meal.</p>
                        </div>

                        {/* 1. Cuisines */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">1. Cuisines</label>
                            <div className="flex flex-wrap gap-2">
                                {OPTIONS.cuisines.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => toggleSelection('cuisines', opt)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${selections.cuisines.includes(opt)
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Restaurant Vibe */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">2. Restaurant Vibe</label>
                            <div className="flex flex-wrap gap-2">
                                {OPTIONS.rest_type.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => toggleSelection('rest_type', opt)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${selections.rest_type.includes(opt)
                                            ? 'bg-teal-500 text-white border-teal-500 shadow-md transform scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Budget */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                3. Budget (Approx for two persons) (₹{selections.budget})
                            </label>
                            <input
                                type="range"
                                min="100" max="2000" step="100"
                                value={selections.budget}
                                onChange={(e) => setSelections({ ...selections, budget: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 font-mono">
                                <span>₹100</span>
                                <span>₹2000+</span>
                            </div>
                        </div>

                        {/* 4. Location */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">4. Location</label>
                            <div className="relative">
                                <select
                                    value={selections.location}
                                    onChange={(e) => setSelections({ ...selections, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none appearance-none cursor-pointer"
                                >
                                    {OPTIONS.locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* 5. Specific Dishes (Input) */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">5. Specific Dishes</label>
                            <input
                                type="text"
                                placeholder="e.g. Butter Chicken, Pasta, Sushi (comma separated)..."
                                value={selections.dish_pref}
                                onChange={(e) => setSelections({ ...selections, dish_pref: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Lock In Button (Moved here) */}
                        <div className="pt-6 border-t border-slate-100">
                            {!isSubmitted ? (
                                <PrimaryButton onClick={handleSubmit} className="w-full py-4 text-lg">
                                    Lock In Choices 🔒
                                </PrimaryButton>
                            ) : (
                                <div className="w-full text-center animate-pulse bg-green-100 text-green-700 py-3 rounded-xl font-bold border border-green-200">
                                    ✓ Choices Locked! Waiting for others...
                                </div>
                            )}
                        </div>

                    </div>
                </GlassCard>

                {/* Right: Status Panel */}
                <div className="space-y-6 sticky top-6">
                    <GlassCard>
                        <div className="text-center space-y-6">
                            <div className="bg-orange-100 text-orange-600 font-mono font-bold text-xl py-2 rounded-xl border border-orange-200">
                                Group: {session.groupId}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-4xl font-extrabold text-slate-800">{joinedCount || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-extrabold text-slate-800">{readyCount || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready</div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full my-4"></div>

                            {isSubmitted && (
                                <button
                                    onClick={handleCompute}
                                    className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold shadow-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                                    disabled={isComputed}
                                >
                                    {isComputed ? 'Computing...' : 'Reveal Results ✨'}
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </Background>
    );
}
