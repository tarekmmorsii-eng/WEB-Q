import React from 'react';
import { MessageSquare, Bug } from 'lucide-react';
import { useFeedback } from '../contexts/FeedbackContext';
import clsx from 'clsx';

export default function FloatingFeedbackButton() {
    const { openFeedback } = useFeedback();

    return (
        <button
            onClick={() => openFeedback('suggestion')}
            className={clsx(
                "fixed bottom-24 left-4 z-[90]", // Above bottom bar (usually z-50/60)
                "flex items-center gap-2",
                "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
                "p-3 rounded-full shadow-lg shadow-orange-500/30",
                "hover:scale-105 active:scale-95 transition-all duration-300",
                "border-2 border-white/20",
                "group"
            )}
            title="ملاحظات / إبلاغ عن خطأ"
        >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap font-bold text-sm">
                ملاحظات
            </span>

            {/* Pulse Effect */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </button>
    );
}
