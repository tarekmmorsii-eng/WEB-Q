import React from 'react';
import { FileX, type LucideProps } from 'lucide-react';

/** Shared outlined deletion mark: a folded document with a red cross. */
export default function DeleteIcon({size=20,style,className,...props}:LucideProps) {
    return <FileX {...props} size={size} fill="none" strokeWidth={2}
        className={['app-delete-icon',className].filter(Boolean).join(' ')}
        style={{...style,color:'var(--library-danger, #dc2626)',flexShrink:0}}
        data-delete-icon="true" aria-hidden="true" focusable="false"/>;
}
