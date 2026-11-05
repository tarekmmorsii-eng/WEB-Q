import ModalLogo from './ModalLogo';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { getPrivacyContributionText } from '../i18n/privacyContributionText';
import { applyMeasurementChoice } from '../services/measurementConsent';

const KEY = 'mushaf_measurement_choice_v1';
type Age = 'under13' | '13to17' | 'adult' | 'unknown';
type Choice = { version: 1; age: Age; allowed: boolean; savedAt: string };
function readChoice(): Choice | null {
    try {
        const value = JSON.parse(localStorage.getItem(KEY) || 'null');
        return value?.version === 1 && ['under13', '13to17', 'adult', 'unknown'].includes(value.age)
            && typeof value.allowed === 'boolean' && (!value.allowed || value.age === 'adult') ? value : null;
    } catch { return null; }
}

export default function MeasurementConsent({ language, ready, onVisibilityChange }: { language: string; ready: boolean; onVisibilityChange?: (visible: boolean) => void }) {
    const [choice, setChoice] = useState(readChoice);
    const [editing, setEditing] = useState(false);
    const [age, setAge] = useState<Age | ''>('');
    const [error, setError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [retryChoice, setRetryChoice] = useState<{ age: Age; allowed: boolean } | null>(null);
    const { copy, dir } = getPrivacyContributionText(language);
    useLayoutEffect(() => { onVisibilityChange?.(ready && (!choice || editing)); }, [ready, choice, editing, onVisibilityChange]);
    useEffect(() => { applyMeasurementChoice(readChoice()).catch(() => { setError(true); setEditing(true); }); }, []);
    useEffect(() => {
        const open = () => { setAge(choice?.age || ''); setEditing(true); setError(false); setRetryChoice(null); };
        window.addEventListener('open-measurement-choice', open);
        return () => window.removeEventListener('open-measurement-choice', open);
    }, [choice]);
    const save = async (selected: Age, allowed: boolean) => {
        if (saving) return;
        setRetryChoice({ age: selected, allowed });
        setSaving(true);
        const next: Choice = { version: 1, age: selected, allowed: selected === 'adult' && allowed, savedAt: new Date().toISOString() };
        try { localStorage.setItem(KEY, JSON.stringify(next)); }
        catch { setError(true); setSaving(false); return; }
        try { await applyMeasurementChoice(next); }
        catch {
            // Do not leave a failed activation queued for automatic retry at next launch.
            if (next.allowed) {
                const denied = { ...next, allowed: false };
                try { localStorage.setItem(KEY, JSON.stringify(denied)); } catch { /* Keep error visible. */ }
                await applyMeasurementChoice(denied).catch(() => undefined);
            }
            setError(true); setSaving(false); return;
        }
        setSaving(false);
        setChoice(next); setEditing(false); setError(false); setRetryChoice(null);
        window.dispatchEvent(new CustomEvent('measurement-choice-changed', { detail: next }));
    };
    if (!ready || (choice && !editing)) return null;
    return <div className="app-modal fixed inset-0 z-[100000] bg-black/60 flex items-center justify-center p-4" dir={dir}>
        <section role="dialog" aria-modal="true" aria-labelledby="measurement-title" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white text-slate-800 p-6 shadow-xl">
            <h2 id="measurement-title" className="modal-branded-title text-xl font-bold mb-3"><ModalLogo />{copy.title}</h2>
            <label htmlFor="measurement-age" className="block mb-2">{copy.age}</label>
            <select autoFocus disabled={saving} id="measurement-age" value={age} onChange={e => { setAge(e.target.value as Age); setRetryChoice(null); setError(false); }} className="w-full border border-slate-400 rounded-lg p-3 bg-white mb-4">
                <option value="" disabled>{copy.select}</option>
                <option value="under13">{copy.under13}</option>
                <option value="13to17">{copy.teen}</option>
                <option value="adult">{copy.adult}</option>
            </select>
            {age === 'adult' && <>
                <p className="font-semibold mb-3">{copy.heading}</p>
                <p className="text-sm leading-7 mb-3">{copy.intro}</p>
                <p className="text-sm leading-7 mb-3">{copy.purpose}</p>
                <p className="text-sm leading-7 mb-3">{copy.excluded}</p>
                <p className="text-sm leading-7 mb-3">{copy.disclosure}</p>
                <a href="/privacy.html" target="_blank" rel="noreferrer" className="underline text-amber-800">{copy.policy}</a>
                {choice && !choice.allowed && <div className="text-sm leading-7 mt-3 space-y-3">
                    <p>{copy.welcome}</p>
                    <p>{copy.pending}</p>
                    <p>{copy.withdraw}</p>
                </div>}
            </>}
            <p className="text-sm mt-3 mb-4">{age === 'under13' || age === '13to17'
                ? (copy.minor)
                : (copy.general)}</p>
            <div className="flex flex-col gap-3">
                {age === 'adult' && <button disabled={saving} onClick={() => save('adult', true)} className="rounded-lg border border-amber-700 p-3 font-bold text-amber-900">{copy.allow}</button>}
                <button disabled={saving} onClick={() => save(age || 'unknown', false)} className="rounded-lg border border-slate-500 p-3 font-bold">{age === 'under13' || age === '13to17' ? (copy.continue) : (copy.skip)}</button>
            </div>
            {error && <div className="mt-3">
                <p role="alert" className="text-red-700">{copy.error}</p>
                <button disabled={saving} className="mt-3 rounded-lg border border-slate-500 p-3 font-bold" onClick={() => {
                    const retry = retryChoice || readChoice() || { age: 'unknown' as Age, allowed: false };
                    void save(retry.age, retry.allowed);
                }}>{copy.retry}</button>
            </div>}
        </section>
    </div>;
}
