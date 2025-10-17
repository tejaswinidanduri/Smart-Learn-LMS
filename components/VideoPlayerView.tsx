import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../App';
import type { VideoMaterial, VideoNote } from '../types';
import { Input, TextArea, Button, Spinner } from './ui';
import { SparklesIcon, NoteIcon, FileExportIcon, SendIcon } from './Icons';
import { answerQuestionAboutVideo } from '../services/geminiService';

interface VideoPlayerViewProps {
    video: VideoMaterial;
    onClose: () => void;
}

type ChatMessage = {
    sender: 'user' | 'ai';
    text: string;
};

const formatTimestamp = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ video, onClose }) => {
    const { currentUser, findVideoNotesByVideoIdAndStudentId, createVideoNote } = useAppContext();
    const [activeTab, setActiveTab] = useState<'ai' | 'notes'>('ai');
    const videoRef = useRef<HTMLVideoElement>(null);

    // AI Assistant State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userQuery, setUserQuery] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Notes State
    const [newNoteContent, setNewNoteContent] = useState('');
    const myNotes = currentUser ? findVideoNotesByVideoIdAndStudentId(video.id, currentUser.id) : [];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    const handleSeekVideo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
        }
    };

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userQuery.trim() || isAiLoading) return;
        
        const query = userQuery;
        setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
        setUserQuery('');
        setIsAiLoading(true);

        try {
            const responseText = await answerQuestionAboutVideo(query, video.transcript);
            setChatHistory(prev => [...prev, { sender: 'ai', text: responseText }]);
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const parseAndRenderResponse = (text: string) => {
        const timestampRegex = /\[(\d{1,2}):(\d{2})\]/;
        const match = text.match(timestampRegex);
        
        if (!match) return <p>{text}</p>;

        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const totalSeconds = (minutes * 60) + seconds;
        const responseText = text.replace(timestampRegex, '').trim();

        return (
            <div>
                <button
                    onClick={() => handleSeekVideo(totalSeconds)}
                    className="mb-2 inline-block bg-primary/20 text-primary font-bold py-1 px-3 rounded-md hover:bg-primary/30"
                >
                    Jump to {formatTimestamp(totalSeconds)}
                </button>
                <p>{responseText}</p>
            </div>
        );
    };

    const handleAddNote = () => {
        if (!newNoteContent.trim() || !videoRef.current) return;
        createVideoNote({
            videoId: video.id,
            content: newNoteContent,
            timestamp: videoRef.current.currentTime,
        });
        setNewNoteContent('');
    };
    
    const handleExportNotes = () => {
        if (myNotes.length === 0) return;
        const title = `Notes for ${video.fileName.split('.').slice(0, -1).join('.')}`;
        const content = myNotes.map(note => `[${formatTimestamp(note.timestamp)}] - ${note.content}`).join('\n');
        const textToExport = `${title}\n\n${content}`;
        
        const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const TabButton: React.FC<{tab: 'ai' | 'notes', icon: React.ReactNode, children: React.ReactNode}> = ({tab, icon, children}) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center justify-center p-3 font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-copy-light hover:text-copy'}`}
        >
           {icon}<span className="ml-2">{children}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glassmorphism rounded-xl w-full max-w-6xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-semibold neon-text-primary">{video.fileName}</h3>
                    <Button onClick={onClose} variant="secondary" className="py-1 px-3 text-sm">
                        <span className="mr-2">&larr;</span> Back to Course
                    </Button>
                </div>
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-2/3 bg-black">
                        <video ref={videoRef} src={video.fileUrl} controls className="w-full h-full object-contain" />
                    </div>
                    <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
                        <div className="flex border-b border-white/10">
                            <TabButton tab="ai" icon={<SparklesIcon />} >AI Assistant</TabButton>
                            <TabButton tab="notes" icon={<NoteIcon />}>My Notes</TabButton>
                        </div>
                        
                        {activeTab === 'ai' ? (
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                                    <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm">
                                        <p><strong className="text-primary">AI Assistant:</strong> Ask me anything about this video!</p>
                                    </div>
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-surface' : 'bg-black/20'}`}>
                                            {msg.sender === 'ai' ? parseAndRenderResponse(msg.text) : <p>{msg.text}</p>}
                                        </div>
                                    ))}
                                    {isAiLoading && <div className="flex justify-center"><Spinner /></div>}
                                </div>
                                <form onSubmit={handleAskAI} className="p-2 border-t border-white/10 flex gap-2">
                                    <Input label="" placeholder="Ask a question..." value={userQuery} onChange={e => setUserQuery(e.target.value)} />
                                    <Button type="submit" aria-label="Send question" disabled={isAiLoading}><SendIcon /></Button>
                                </form>
                            </div>
                        ) : (
                             <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                                    {myNotes.length > 0 ? (
                                        myNotes.map(note => (
                                            <div key={note.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
                                                <button onClick={() => handleSeekVideo(note.timestamp)} className="text-sm font-bold text-primary hover:underline">{formatTimestamp(note.timestamp)}</button>
                                                <p className="mt-1">{note.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-copy-light text-center p-8">You haven't taken any notes for this video yet.</p>
                                    )}
                                </div>
                                <div className="p-2 border-t border-white/10 space-y-2">
                                    <TextArea label="" placeholder="Write a new note..." value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} rows={3} />
                                    <div className="flex justify-between items-center">
                                         <Button onClick={handleExportNotes} variant="secondary" disabled={myNotes.length === 0}><FileExportIcon /> <span className="ml-2">Export</span></Button>
                                         <Button onClick={handleAddNote}>Add Note</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerView;