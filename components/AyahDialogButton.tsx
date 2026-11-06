import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ayahToolsText, notesDirection } from '../i18n/ayahToolsText';

type Props = { kind: 'back' | 'close'; language: string; onClick: () => void; disabled?: boolean; label?: string };
export default function AyahDialogButton({ kind, language, onClick, disabled, label }: Props) {
    const text = ayahToolsText(language);
    return <button type="button" data-ayah-dialog-button={kind} aria-label={label || (kind === 'back' ? text.back : text.close)} disabled={disabled} onClick={onClick}
        className={`rounded-lg px-3 py-2 min-h-11 border border-[var(--border-primary)] font-bold disabled:opacity-40 shrink-0 inline-flex items-center justify-center ${kind === 'close' ? 'text-red-600' : ''}`}>
        {kind === 'close' ? <X size={22}/> : <ArrowRight size={18} style={{transform:notesDirection(language)==='ltr'?'rotate(180deg)':undefined}}/>}
    </button>;
}
