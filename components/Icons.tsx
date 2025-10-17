import React from 'react';

export const SmartLearnLogo: React.FC = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
             <filter id="logo-glow">
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#00ffff" />
            </filter>
        </defs>
        <g stroke="url(#logo-grad)" filter="url(#logo-glow)">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>

            {/* Book Path (bottom part) */}
            <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
            {/* Book pages (top part) */}
            <path d="M19 12a7 7 0 1 0 -14 0" />
            <line x1="12" y1="12" x2="12" y2="21" />
            {/* Text lines */}
            <line x1="7" y1="15" x2="9" y2="15" />
            <line x1="15" y1="15" x2="17" y2="15" />
            <line x1="7" y1="18" x2="10" y2="18" />
            <line x1="14" y1="18" x2="17" y2="18" />
            
            {/* Cap Path */}
            <path d="M12 2l-10 5l10 5l10-5l-10-5z" />
            {/* Tassel */}
            <path d="M17.5 7.5v3" />
            <path d="M17.5 10.5a.5 .5 0 1 0 0 1a.5 .5 0 0 0 0 -1" />
        </g>
    </svg>
);


export const LogoutIcon: React.FC<{className?: string}> = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const UserPlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

export const PlusCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export const BellIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const ChatBubbleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export const PaperClipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const ChartBarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const CalendarIcon: React.FC<{className?: string}> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const ClipboardCheckIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const ClipboardListIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01" />
    </svg>
);

export const ChartPieIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

export const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ClockIcon: React.FC<{className?: string}> = ({ className = 'h-8 w-8' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

export const MegaphoneIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.104 9.168-5.182M5.436 13.683L4.75 15.75M5.436 13.683A4.001 4.001 0 007 18h1.832c4.1 0 7.625 2.104 9.168 5.182" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export const CreditCardIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

export const GooglePayLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.38 8.13a4.33 4.33 0 00-3.52-3.52 4.33 4.33 0 00-4.73 4.73v.2c0 .24.16.44.39.44.23 0 .4-.2.4-.44v-.2a3.54 3.54 0 013.54-3.54c1.92 0 3.53 1.6 3.53 3.54s-1.6 3.54-3.53 3.54h-2.92a.4.4 0 00-.4.4v5.3c0 .24.16.4.39.4h.01c.23 0 .4-.16.4-.4v-2.3h2.52c3.48 0 5.23-2.31 5.23-5.14 0-1.87-1.12-3.4-2.73-4.32zm-3.53 5.43h-2.52v-3.5h2.52a1.77 1.77 0 110 3.5z" fill="#34a853"/>
        <path d="M4.62 8.13a4.33 4.33 0 013.52-3.52A4.33 4.33 0 0112.87 9.3v3.54a4.33 4.33 0 01-4.73 4.73 4.33 4.33 0 01-3.52-3.52A4.33 4.33 0 014.62 8.13zm3.53 8.24a3.54 3.54 0 003.54-3.54V9.3a3.54 3.54 0 10-3.54 3.54v3.53z" fill="#fbbc04"/>
        <path d="M4.62 15.87a4.33 4.33 0 003.52 3.52 4.33 4.33 0 004.73-4.73v-3.54a4.33 4.33 0 00-4.73-4.73 4.33 4.33 0 00-3.52 3.52 4.33 4.33 0 004.73 4.73v1.23z" fill="#ea4335"/>
        <path d="M12.87 4.62A4.33 4.33 0 008.14 8.14v1.23a4.33 4.33 0 014.73-4.73 4.33 4.33 0 013.52 3.52 4.33 4.33 0 01-4.73 4.73h-.04v-1.23a3.54 3.54 0 003.54-3.54A3.54 3.54 0 0012.87 4.62z" fill="#4285f4"/>
    </svg>
);

export const PhonePeLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#6739B7" strokeWidth="1.5">
        <path d="M16 17L13 14M13 14L10 17M13 14V21" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.5 3.5C10.5 3.5 10.193 3 9.493 3C8.794 3 8.5 3.5 8.5 3.5L14.5 12.5C14.5 12.5 14.807 13 15.507 13C16.206 13 16.5 12.5 16.5 12.5L10.5 3.5Z" stroke="#6739B7" fill="#6739B7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 8.214C8 8.214 7.693 7.714 6.993 7.714C6.294 7.714 6 8.214 6 8.214L9.5 13.714C9.5 13.714 9.807 14.214 10.507 14.214C11.206 14.214 11.5 13.714 11.5 13.714L8 8.214Z" stroke="#6739B7" fill="#6739B7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const PaytmLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
    <svg className={className} viewBox="0 0 59 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.27 1.45H3.19C2.26 1.45 1.5 2.24 1.5 3.17V15.79C1.5 16.72 2.26 17.51 3.19 17.51H12.27C13.2 17.51 13.96 16.72 13.96 15.79V3.17C13.96 2.24 13.2 1.45 12.27 1.45Z" fill="#002E6E"/>
        <path d="M4.39 12.39L6.15 8.91H7.21L5.45 12.39H4.39ZM8.9 12.39V6.57H7.72V5.41H11.6V6.57H10.42V12.39H8.9ZM3.3 5.41L5.2 8.89H5.22L7.12 5.41H8.4L5.78 9.87V12.39H4.6V9.85L1.92 5.41H3.3Z" fill="white"/>
        <path d="M16.52 14.8L18.28 11.32H19.34L17.58 14.8H16.52ZM21.03 14.8V8.98H19.85V7.82H23.73V8.98H22.55V14.8H21.03ZM15.43 7.82L17.33 11.3H17.35L19.25 7.82H20.53L17.91 12.28V14.8H16.73V12.26L14.05 7.82H15.43Z" fill="#00B9F1"/>
        <path d="M26.26 8.98V14.8H24.74V7.82H26.16L29.28 11.8V7.82H30.72V14.8H29.3L26.26 10.78V14.8H26.26V8.98Z" fill="#00B9F1"/>
        <path d="M38.84 10.56C38.84 12.98 37.08 14.88 34.78 14.88C32.48 14.88 30.72 12.98 30.72 10.56C30.72 8.14 32.48 6.24 34.78 6.24C37.08 6.24 38.84 8.14 38.84 10.56ZM32.22 10.56C32.22 12.16 33.36 13.4 34.78 13.4C36.2 13.4 37.34 12.16 37.34 10.56C37.34 8.96 36.2 7.72 34.78 7.72C33.36 7.72 32.22 8.96 32.22 10.56Z" fill="#00B9F1"/>
        <path d="M43.95 7.82L45.85 11.3H45.87L47.77 7.82H49.05L46.43 12.28V14.8H45.25V12.26L42.57 7.82H43.95Z" fill="#00B9F1"/>
        <path d="M57.49 9.1V14.8H55.97V9.1L53.53 9.4V8.02L57.25 7.16H57.49V9.1Z" fill="#00B9F1"/>
    </svg>
);

export const VideoCameraIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-2.293 2.293m0-4.586l2.293-2.293a1 1 0 011.414 0l2.293 2.293m-4.586 0l-2.293 2.293a1 1 0 01-1.414 0l-2.293-2.293m4.586 0l2.293 2.293" />
    </svg>
);

export const FileExportIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const NoteIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);