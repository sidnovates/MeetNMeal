import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAppContext } from '../App';
import { MapPin, Star, Trophy, RotateCcw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";
import { wsService } from '../services/websocket';

export default function Results() {
    const { session, setSession } = useAppContext();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await api.getResults(session.groupId);
                setResults(data.restaurants || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [session.groupId]);

    const handleStartNewSession = async () => {
        if (isEnding) return;
        setIsEnding(true);
        try {
            await api.closeGroup(session.groupId);
            // Immediately exit for the user who clicked
            setSession({ groupId: null, userId: null });
            navigate('/');
            toast.success("Session ended");
        } catch (err) {
            console.error(err);
            toast.error("Failed to close session");
            setIsEnding(false);
        }
    };

    const handleLeaveLocally = () => {
        setSession({ groupId: null, userId: null });
        navigate('/');
    };

    if (loading) {
        return (
            <Background>
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <span className="text-6xl">🍳</span>
                    <h2 className="text-2xl font-bold text-white">Cooking up results...</h2>
                </div>
            </Background>
        );
    }

    return (
        <Background>
            <div className="w-full max-w-2xl space-y-6 pb-20 relative">
                {/* print results */}
                {console.log(results)}
                {results.length === 0 ? (
                    <GlassCard>
                        <div className="text-center py-8">
                            <h2 className="text-2xl font-bold text-secondary">No Matches Found 😢</h2>
                            <p className="text-textMuted mt-2">Try being less picky next time!</p>
                            <button onClick={handleLeaveLocally} className="mt-6 text-orange-500 font-bold hover:underline">Start Over</button>
                        </div>
                    </GlassCard>
                ) : (
                    <>
                        <div className="text-center space-y-2 animate-slide-up">
                            <h2 className="text-4xl font-extrabold text-white drop-shadow-md">It's a Match! 🎉</h2>
                            <p className="text-orange-100 font-medium">Top recommendation for your group</p>
                        </div>

                        {/* Winner Card */}
                        <div className="relative animate-slide-up delay-100 transform hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 rounded-[2.5rem] blur opacity-75 animate-pulse"></div>
                            <GlassCard>
                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-bl-2xl rounded-tr-2xl font-black text-sm shadow-sm flex items-center gap-1">
                                    <Trophy size={14} /> WINNER
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl shrink-0 border-4 border-white shadow-inner">
                                        🍽️
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-2">
                                        <h3 className="text-3xl font-extrabold text-slate-800 leading-tight">{results[0].name}</h3>
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            <span className="badge bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">{results[0].cuisines?.split(',')[0]}</span>
                                            <span className="badge bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">₹{results[0].cost}</span>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium pt-2">
                                            <span className="flex items-center gap-1"><MapPin size={16} /> {results[0].location}</span>
                                            <span className="flex items-center gap-1 text-orange-500 font-bold"><Star size={16} fill="currentColor" /> {results[0].rate}/5</span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Recommended List */}
                        <div className="space-y-3">
                            <h3 className="text-white font-bold uppercase tracking-wider text-sm pl-4 opacity-80">Top Recommendations</h3>
                            {results.slice(1, 10).map((r, i) => (
                                <div key={i} className="bg-white/40 backdrop-blur-md border border-white/40 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/60 transition-colors cursor-pointer">
                                    <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0">#{i + 2}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 truncate">{r.name}</div>
                                        <div className="text-xs text-slate-600 truncate">{r.cuisines}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {r.location}</span>
                                            {r.rate && <span className="flex items-center gap-1 text-orange-600 font-bold"><Star size={12} fill="currentColor" /> {r.rate}</span>}
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-slate-700 text-sm whitespace-nowrap">₹{r.cost}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <PrimaryButton onClick={handleStartNewSession} disabled={isEnding}>
                    {isEnding ? (
                        <>Ending Session... <Loader2 size={18} className="inline ml-2 animate-spin" /></>
                    ) : (
                        <>End Session <RotateCcw size={18} className="inline ml-2" /></>
                    )}
                </PrimaryButton>

            </div>
        </Background>
    );
}
