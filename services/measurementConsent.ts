import { Capacitor, registerPlugin } from '@capacitor/core';
type Choice = { version: number; age: string; allowed: boolean };
const native = registerPlugin<{ applyChoice(choice: Choice): Promise<{ available: boolean; enabled: boolean }> }>('MetaMeasurement');
let pending: Promise<unknown> = Promise.resolve();
export function applyMeasurementChoice(choice: Choice | null) {
    const safe = { version: 1, age: choice?.age || 'unknown', allowed: choice?.version === 1 && choice.age === 'adult' && choice.allowed === true };
    if (Capacitor.getPlatform() !== 'android') return Promise.resolve({ available: false, enabled: false });
    const result = pending.catch(() => undefined).then(() => native.applyChoice(safe));
    pending = result;
    return result;
}
