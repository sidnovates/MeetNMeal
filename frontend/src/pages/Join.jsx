import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { useAppContext } from '../App';
import Background from "../components/Background";
import GlassCard from "../components/GlassCard";

export default function Join() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { setSession } = useAppContext();
    const [status, setStatus] = useState('Joining...');
    const hasJoined = useRef(false);

    useEffect(() => {
        const joinSession = async () => {
            if (!groupId || hasJoined.current) return;
            hasJoined.current = true;

            try {
                const data = await api.joinGroup(groupId);

                // Initialize WebSocket connection
                wsService.connect(groupId, data.user_id);

                // Save session (Global State)
                setSession({ groupId, userId: data.user_id });

                setStatus('Connected! Redirecting...');
                setTimeout(() => {
                    navigate('/preferences');
                }, 1000);

            } catch (err) {
                console.error(err);
                setStatus(`Error: ${err.message}`);
                hasJoined.current = false; // Reset on failure so they can retry
                setTimeout(() => navigate('/'), 3000);
            }
        };
        joinSession();
    }, [groupId, navigate, setSession]);

    return (
        <Background>
            <GlassCard>
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-orange-500">
                            🚀
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-secondary">Joining Group...</h2>
                        <p className="font-mono text-lg bg-orange-100 text-orange-600 px-4 py-1 rounded-full inline-block">
                            {groupId}
                        </p>
                        <p className="text-textMuted">{status}</p>
                    </div>
                </div>
            </GlassCard>
        </Background>
    );
}
