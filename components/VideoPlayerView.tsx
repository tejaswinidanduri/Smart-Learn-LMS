import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import type { VideoMaterial } from '../types';
import { TextArea, Button } from './ui';
import { NoteIcon, FileExportIcon } from './Icons';

interface VideoPlayerViewProps {
    video: VideoMaterial;
    onClose: () => void;
}

const formatTimestamp = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ video, onClose }) => {
    const { currentUser, findVideoNotesByVideoIdAndStudentId, createVideoNote } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Notes State
    const [newNoteContent, setNewNoteContent] = useState('');
    const myNotes = currentUser ? findVideoNotesByVideoIdAndStudentId(video.id, currentUser.id) : [];
    
    const handleSeekVideo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
        }
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
                        <div className="p-3 border-b border-white/10 flex items-center justify-center">
                            <h3 className="font-semibold text-lg text-primary flex items-center"><NoteIcon /><span className="ml-2">My Notes</span></h3>
                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerView;