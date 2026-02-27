import { useState, useEffect } from 'react';
import api from '../api';
import TranscriptPanel from '../components/TranscriptPanel';
import ActionPanel from '../components/ActionPanel';
import QuickStats from '../components/QuickStats';

export default function DashboardView() {
    // Persistent State: Initialized from localStorage to prevent data loss on tab switch
    const [transcript, setTranscript] = useState(() => {
        const saved = localStorage.getItem('aether_transcript');
        return saved ? JSON.parse(saved) : [];
    });

    const [actionItems, setActionItems] = useState(() => {
        const saved = localStorage.getItem('aether_actions');
        return saved ? JSON.parse(saved) : [];
    });

    const [isListening, setIsListening] = useState(false);
    const [ghostMode, setGhostMode] = useState(false);

    // Effect: Sync state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('aether_transcript', JSON.stringify(transcript));
    }, [transcript]);

    useEffect(() => {
        localStorage.setItem('aether_actions', JSON.stringify(actionItems));
    }, [actionItems]);

    // This is called when TranscriptPanel finishes a recording
    const handleTranscriptionResult = async (newText) => {
        // 1. Update Transcript UI instantly
        setTranscript(prev => [...prev, newText]);

        try {
            // 2. Send to Backend Intelligence Layer
            const response = await api.post('/process-transcript', {
                text: newText,
                meeting_id: "techsolvers_session_1",
                ghost_mode: ghostMode
            });

            // 3. Update Action Items if Llama 3 found anything
            if (response.data.calendar_events && response.data.calendar_events.length > 0) {
                setActionItems(prev => [...response.data.calendar_events, ...prev]);
            }
        } catch (err) {
            console.error("Failed to process intelligence:", err);
        }
    };

    const toggleGhostMode = () => setGhostMode(!ghostMode);
    const toggleListen = () => setIsListening(!isListening);

    return (
        <div className="flex flex-col h-full gap-6 overflow-hidden">
            {/* Top Row: Statistics & Intelligence Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <QuickStats
                    transcriptCount={transcript.length}
                    actionCount={actionItems.length}
                    ghostMode={ghostMode}
                />
            </div>

            {/* Bottom Row: Main Interaction Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left: Live Transcription (8 Units) */}
                <div className="lg:col-span-8 h-full min-h-[400px]">
                    <TranscriptPanel
                        transcript={transcript}
                        isListening={isListening}
                        onToggleListen={() => setIsListening(!isListening)}
                        onTranscriptionResult={handleTranscriptionResult}
                        ghostMode={ghostMode}
                        onToggleGhost={() => setGhostMode(!ghostMode)}
                    />
                </div>

                {/* Right: Extracted Intelligence (4 Units) */}
                <div className="lg:col-span-4 h-full min-h-[400px]">
                    <ActionPanel actions={actionItems} calendarStatus="Active" />
                </div>
            </div>
        </div>
    );
}