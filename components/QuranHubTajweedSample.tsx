import React, { useState } from 'react';

// Snapshot of the two public QuranHub responses checked on 2026-10-21.
// The source offset convention is not yet validated; this pilot highlights the
// unique returned span in this exact word rather than assuming offset units.
const word = 'وَأَنزَلَ';
const span = 'ن';
const index = word.indexOf(span);

export default function QuranHubTajweedSample() {
    const [expanded, setExpanded] = useState(true);
    return <section dir="rtl" lang="ar" aria-label="تجربة QuranHub" style={{ background: '#fffdf7', color: '#20252c', border: '2px solid #15803d', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 21, fontWeight: 700 }}>تجربة QuranHub — البقرة ٢٢</h3>
        <p style={{ marginTop: 8, lineHeight: 1.8 }}>اضغط على الكلمة لعرض الحكم أو إخفائه.</p>
        <button aria-expanded={expanded} aria-controls="quranhub-rule-example" onClick={() => setExpanded(!expanded)} style={{ display: 'block', width: '100%', padding: '16px 8px', margin: '12px 0', background: '#eef8ef', borderRadius: 12, fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: 44, lineHeight: 1.8 }}>
            {word.slice(0, index)}<span style={{ color: '#166534', background: '#d6edb8', borderBottom: '3px solid #166534' }}>{span}</span>{word.slice(index + span.length)}
        </button>
        {expanded && <div id="quranhub-rule-example">
            <p style={{ fontSize: 19, fontWeight: 700 }}>إخفاء نون ساكنة</p>
            <p style={{ margin: '10px 0' }}>موضع الحكم: <strong>النون</strong> · اللون: أخضر</p>
            <p style={{ fontWeight: 700 }}>شرح المصدر:</p>
            <p style={{ fontSize: 18, lineHeight: 2 }}>نطق النون الساكنة بصفة بين الإظهار والإدغام عار عن التشديد مع بقاء الغنة.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                <a className="underline" href="https://api.qurani.ai/gw/qh/v1/word/tajweed?location=2:22:8" target="_blank" rel="noopener noreferrer">مصدر الموضع</a>
                <a className="underline" href="https://api.qurani.ai/gw/qh/v1/tajweed/rules/ikhafa_noon?lang=ar" target="_blank" rel="noopener noreferrer">مصدر الشرح</a>
            </div>
        </div>}
        <p style={{ fontSize: 13, lineHeight: 1.8, marginTop: 16 }}>عينة محفوظة من استجابة QuranHub بتاريخ ٢١ أكتوبر ٢٠٢٦، دون إعادة صياغة للشرح. تخص هذه الكلمة فقط؛ فحص المصدر العلمي ما زال جاريًا.</p>
    </section>;
}
