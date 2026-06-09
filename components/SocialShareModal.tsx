import React from 'react';
import { X, MessageCircle, Send, Facebook, MessageSquare, Copy, Share } from 'lucide-react';
import clsx from 'clsx';
import { translations, Language } from '../i18n/translations';

interface SocialShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLanguage: Language;
    shareUrl?: string;
    shareTitle?: string;
    shareText?: string;
}

export default function SocialShareModal({
    isOpen,
    onClose,
    currentLanguage,
    shareUrl = 'https://play.google.com/store/apps/details?id=com.mushafalmurajaa.app',
    shareTitle,
    shareText
}: SocialShareModalProps) {
    const t = translations[currentLanguage];
    
    if (!isOpen) return null;

    const defaultTitle = t.shareAppTitle;
    const defaultText = t.shareAppText;

    const finalTitle = shareTitle || defaultTitle;
    const finalText = shareText || defaultText;
    const fullMessage = `${finalTitle}\n${finalText}\n${shareUrl}`;

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366]',
            hoverColor: 'hover:bg-[#128C7E]',
            url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`
        },
        {
            name: 'Telegram',
            icon: Send,
            color: 'bg-[#0088cc]',
            hoverColor: 'hover:bg-[#0077b5]',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(finalText)}`
        },
        {
            name: 'Messenger',
            icon: MessageSquare,
            color: 'bg-[#0084FF]',
            hoverColor: 'hover:bg-[#0072e6]',
            url: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}` // Note: Desktop might need a different handling
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2]',
            hoverColor: 'hover:bg-[#145dbf]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        }
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert(t.linkCopied);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: finalTitle,
                    text: finalText,
                    url: shareUrl
                });
                onClose();
            } catch (err) {
                console.error('Native share failed:', err);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm">
            <div 
                className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-[var(--border-primary)] animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-secondary)]">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {t.shareAppNative}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--border-primary)] rounded-full transition-colors">
                        <X size={20} className="text-[var(--text-primary)] opacity-60" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {shareOptions.map((opt) => (
                            <a
                                key={opt.name}
                                href={opt.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={clsx(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 transform hover:scale-105",
                                    opt.color,
                                    "text-white shadow-md hover:shadow-lg"
                                )}
                            >
                                <opt.icon size={32} />
                                <span className="text-sm font-bold">{opt.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-center gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-primary)] hover:bg-opacity-20 transition-all font-medium"
                        >
                            <Copy size={20} className="text-amber-600" />
                            <span>{t.copyLink}</span>
                        </button>

                        {navigator.share && (
                            <button
                                onClick={handleNativeShare}
                                className="w-full flex items-center justify-center gap-3 p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all font-bold"
                            >
                                <Share size={20} />
                                <span>{t.otherOptions}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Message */}
                <div className="p-4 bg-[var(--bg-secondary)] text-center">
                    <p className="text-[10px] text-[var(--text-primary)] opacity-50 px-4">
                        {t.shareAppDescNative}
                    </p>
                </div>
            </div>
        </div>
    );
}
