import { Mic, Pause, Ghost, ShieldOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function TranscriptPanel({ transcript, isListening, onToggleListen, onTranscriptionResult, ghostMode, onToggleGhost, token }) {
    const scrollRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]); // Use a Ref for chunks to avoid state delay issues

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Explicitly set mimeType for better compatibility with Whisper
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = []; // Clear previous chunks

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Create Blob immediately from chunksRef
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Debug: Check if we actually captured audio
                console.log("Recording stopped. Blob size:", audioBlob.size);

                if (audioBlob.size < 1000) {
                    console.warn("Audio blob is too small, possibly silent.");
                }

                const formData = new FormData();
                // 'file' must match your FastAPI parameter: file: UploadFile = File(...)
                formData.append('file', audioBlob, 'meeting_recording.webm');

                try {
                    // Update your endpoint to 8005 to match your backend
                    const response = await axios.post('http://localhost:8005/api/transcribe', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.transcript) {
                        onTranscriptionResult(response.data.transcript);
                    }
                } catch (err) {
                    console.error("Transcription upload failed:", err.response?.data || err.message);
                }
            };

            mediaRecorder.start();
            onToggleListen();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check browser permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            onToggleListen();
        }
    };

    const handleToggle = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="glass-morphism p-8 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

            <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}></div>
                        <div className={`absolute inset-0 w-3 h-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        Live Transcript
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleGhost}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-xs font-bold uppercase tracking-widest ${ghostMode
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                            }`}
                    >
                        {ghostMode ? <Ghost size={14} className="animate-pulse" /> : <ShieldOff size={14} />}
                        {ghostMode ? 'Ghost Mode' : 'Standard Mode'}
                    </button>

                    <button
                        onClick={handleToggle}
                        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ${isListening
                            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                            : 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:scale-110'
                            }`}
                    >
                        {isListening ? (
                            <div className="absolute inset-0 rounded-full animate-pulse bg-red-400/30"></div>
                        ) : (
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-400/20 animate-ping"></div>
                        )}
                        <div className="relative z-10 text-white">
                            {isListening ? <Pause size={24} fill="currentColor" /> : <Mic size={24} fill="currentColor" />}
                        </div>
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {transcript.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                <Mic size={32} className="opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold uppercase tracking-[0.2em]">Ready to Listen</p>
                                <p className="text-xs font-medium text-slate-700 mt-1">Capture meeting insights</p>
                            </div>
                        </motion.div>
                    ) : (
                        transcript.map((line, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 group/line">
                                <div className="mt-1.5 w-1 h-6 rounded-full bg-indigo-500/20 group-hover/line:bg-indigo-500 transition-colors"></div>
                                <p className="text-lg font-light leading-relaxed text-slate-300 group-hover:text-white transition-colors">
                                    {line}
                                </p>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Visualizer bars */}
            {isListening && (
                <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none flex items-end justify-center gap-1 px-8 pb-4 opacity-30">
                    {[30, 60, 45, 80, 55, 90, 40, 70, 50, 85, 35, 65].map((h, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: [h + '%', (h * 0.5) + '%', h + '%'] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1 bg-indigo-500 rounded-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}