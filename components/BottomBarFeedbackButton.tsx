import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useFeedback } from '../contexts/FeedbackContext';

export default function BottomBarFeedbackButton() {
    const { openFeedback } = useFeedback();

    return (
        <button
            onClick={() => openFeedback('interface_notes')}
            className="flex flex-col items-center text-amber-800 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative group"
        >
            <div className="relative">
                <MessageSquare size={20} />
                {/* Pulse dot to indicate it's new/active */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800" />
            </div>
            <span className="text-[10px] whitespace-nowrap">ملاحظات</span>
        </button>
    );
}
