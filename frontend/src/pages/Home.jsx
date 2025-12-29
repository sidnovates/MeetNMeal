import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";
import Logo from "../assets/MeetNMeal_Logo.png";

export default function Home() {
    const navigate = useNavigate();
    const [groupIdInput, setGroupIdInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const data = await api.createGroup();
            navigate(`/join/${data.group_id}`);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = () => {
        if (groupIdInput.trim()) {
            navigate(`/join/${groupIdInput.trim()}`);
        }
    };

    return (
        <Background>
            <GlassCard>
                <div className="flex flex-col items-center text-center space-y-2 mb-8 animate-fade-in">
                    <img src={Logo} alt="MeetNMeal Logo" className="w-24 h-24 object-contain mb-2 drop-shadow-md animate-float rounded-full" />
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 drop-shadow-sm">
                            MeetNMeal
                        </span>
                    </h1>
                    <p className="text-textMuted font-medium text-lg">
                        Sync Your Tastes, <span className="text-secondary font-bold">Eat Together.</span>
                    </p>
                </div>

                <div className="space-y-5 animate-slide-up delay-100">
                    <PrimaryButton onClick={handleCreate}>
                        {loading ? 'Creating Session...' : 'Create Instant Group 🍕'}
                    </PrimaryButton>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR JOIN EXISITING</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter Group Code (e.g. 123456)"
                            value={groupIdInput}
                            onChange={(e) => setGroupIdInput(e.target.value)}
                            className="w-full rounded-2xl px-5 py-4 bg-white/60 border border-white/40 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none text-center font-mono text-lg tracking-widest transition-all placeholder:font-sans placeholder:tracking-normal shadow-inner text-slate-700"
                        />
                        <button
                            onClick={handleJoin}
                            className="w-full flex items-center justify-center gap-2 text-slate-600 font-bold hover:text-orange-600 transition-colors py-2"
                        >
                            Join Session &rarr;
                        </button>
                    </div>
                </div>

                {/* <div className="mt-8 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/50 text-green-700 text-xs font-bold border border-green-200/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        2,341 groups live right now
                    </span>
                </div> */}
            </GlassCard>
        </Background>
    );
}
