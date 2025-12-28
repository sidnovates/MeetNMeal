import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAppContext } from '../App';
import { MapPin, Star, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";

export default function Results() {
    const { session, setSession } = useAppContext();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleLeave = () => {
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

    if (results.length === 0) {
        return (
            <Background>
                <GlassCard>
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-bold text-secondary">No Matches Found 😢</h2>
                        <p className="text-textMuted mt-2">Try being less picky next time!</p>
                        <button onClick={handleLeave} className="mt-6 text-orange-500 font-bold hover:underline">Start Over</button>
                    </div>
                </GlassCard>
            </Background>
        );
    }

    const winner = results[0];

    return (
        <Background>
            <div className="w-full max-w-2xl space-y-6 pb-12">

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
                                <h3 className="text-3xl font-extrabold text-slate-800 leading-tight">{winner.name}</h3>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="badge bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">{winner.cuisines?.split(',')[0]}</span>
                                    <span className="badge bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">₹{winner.cost}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium pt-2">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {winner.location}</span>
                                    <span className="flex items-center gap-1 text-orange-500 font-bold"><Star size={16} fill="currentColor" /> {winner.rate}/5</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Runners Up */}
                <div className="space-y-3">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm pl-4 opacity-80">Close Seconds</h3>
                    {results.slice(1, 4).map((r, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-md border border-white/40 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/60 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center font-bold text-slate-500">#{i + 2}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 truncate">{r.name}</div>
                                <div className="text-xs text-slate-600 truncate">{r.cuisines && r.cuisines.split(',')[0]} • {r.location}</div>
                            </div>
                            <div className="font-bold text-slate-700 text-sm">₹{r.cost}</div>
                        </div>
                    ))}
                </div>

                <PrimaryButton onClick={handleLeave}>
                    Start New Session <RotateCcw size={18} className="inline ml-2" />
                </PrimaryButton>

            </div>
        </Background>
    );
}
