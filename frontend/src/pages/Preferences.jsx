import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";

const OPTIONS = {
    cuisines: ['North Indian', 'Chinese', 'Italian', 'Continental', 'South Indian'],
    rest_type: ['bakery', 'bar', 'beverage_shop', 'bhojanalya', 'cafe', 'casual_dining', 'club', 'confectionery', 'delivery', 'dessert_parlor', 'dhaba', 'fine_dining', 'food_court', 'food_truck', 'irani_cafee', 'kiosk', 'lounge', 'meat_shop', 'mess', 'microbrewery', 'pub', 'quick_bites', 'sweet_shop', 'takeaway','None'],
    dish_pref: ['Biryani', 'Pizza', 'Pasta', 'Sushi', 'Burger'],
};

export default function Preferences() {
    const { session } = useAppContext();
    const navigate = useNavigate();

    // UI State
    const [selections, setSelections] = useState({
        cuisines: [],
        rest_type: [],
        dish_pref: [],
        budget: 500,
        lat: 12.9166,
        lng: 77.6166,
    });
    const [readyCount, setReadyCount] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0); // This might be hard to get without backend change, assuming status update gives it
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isComputed, setIsComputed] = useState(false);

    // Initial Status Check & WebSocket
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await api.getGroupStatus(session.groupId);
                setReadyCount(status.ready_count);
                // Listen for updates
                const unsubReady = wsService.on('USER_READY', (data) => {
                    setReadyCount(data.ready_count);
                });

                // If backend sent session expired
                const unsubExpired = wsService.on('SESSION_EXPIRED', () => {
                    alert("Session Expired!");
                    navigate('/');
                });

                return () => {
                    unsubReady && unsubReady();
                    unsubExpired && unsubExpired();
                };
            } catch (err) {
                console.error(err);
            }
        };
        fetchStatus();
    }, [session.groupId, navigate]);

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
            await api.submitPreferences(session.groupId, session.userId, selections);
            // Now we wait for everyone else or trigger compute
            checkCompute(); // Or wait for WS
        } catch (err) {
            console.error(err);
            setIsSubmitted(false);
            alert("Failed to submit");
        }
    };

    const checkCompute = async () => {
        try {
            // In a real flow, you might wait for WS to say "Everyone Ready"
            // For now, let's just trigger it manually or auto if we are the last one?
            // Simple approach: Trigger compute immediately (backend handles readiness check)
            // But usually we want to wait. Let's add a "Force Compute" or "Wait" UI.
            // For simplicity in this demo:
            // If we assume this user is the last one (or we just want to see results), call compute.
            // Ideally: Poll status until everyone is ready.
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
            alert(err.message);
        }
    };

    return (
        <Background>
            <div className="w-full max-w-4xl grid md:grid-cols-[1fr_350px] gap-6 items-start">

                {/* Left: Form */}
                <GlassCard>
                    <div className="space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-secondary">What are you craving? 😋</h2>
                            <p className="text-textMuted">Select what you're in the mood for.</p>
                        </div>

                        {/* Cuisines */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Cuisines</label>
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

                        {/* Restaurant Type (formerly Vibe) */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Restaurant Vibe</label>
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

                        {/* Dish Preferences */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Favorite Dishes</label>
                            <div className="flex flex-wrap gap-2">
                                {OPTIONS.dish_pref.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => toggleSelection('dish_pref', opt)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${selections.dish_pref.includes(opt)
                                            ? 'bg-rose-500 text-white border-rose-500 shadow-md transform scale-105'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Budget (₹{selections.budget})
                            </label>
                            <input
                                type="range"
                                min="200" max="5000" step="100"
                                value={selections.budget}
                                onChange={(e) => setSelections({ ...selections, budget: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-slate-400 font-mono">
                                <span>₹200</span>
                                <span>₹5000+</span>
                            </div>
                        </div>

                    </div>
                </GlassCard>

                {/* Right: Status Panel */}
                <div className="space-y-6">
                    <GlassCard>
                        <div className="text-center space-y-4">
                            <div className="bg-orange-100 text-orange-600 font-mono font-bold text-xl py-2 rounded-xl border border-orange-200">
                                {session.groupId}
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-extrabold text-slate-800">{readyCount}</div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Friends Ready</div>
                            </div>

                            {!isSubmitted ? (
                                <PrimaryButton onClick={handleSubmit}>
                                    Lock In Choices 🔒
                                </PrimaryButton>
                            ) : (
                                <div className="animate-pulse bg-green-100 text-green-700 py-3 rounded-xl font-bold border border-green-200">
                                    ✓ You are ready!
                                </div>
                            )}

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
