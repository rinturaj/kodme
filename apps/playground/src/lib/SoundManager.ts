export class SoundManager {
    private context: AudioContext | null = null;
    private enabled: boolean = true;
    private lastTypeTime: number = 0;

    constructor () {
        // Initialize AudioContext lazily on first interaction usually, 
        // but we'll try to set it up. Browsers might block auto-play until interaction.
    }

    private getContext(): AudioContext {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.context;
    }

    public playType() {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const delta = now - this.lastTypeTime;
            this.lastTypeTime = now;

            // Calculate modulation based on speed (delta)
            // Fast typing (< 0.1s) -> Higher pitch, shorter duration
            // Slow typing (> 0.3s) -> Base pitch

            // Normalize delta: 0.05 (fast) to 0.3 (slow)
            const clampedDelta = Math.max(0.05, Math.min(0.3, delta));

            // Factor: 1 (fast) to 0 (slow)
            const speedFactor = 1 - ((clampedDelta - 0.05) / 0.25);

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'triangle'; // Clickier than sine

            // Base pitch 800 (higher cut), + up to 600 for speed
            const baseFreq = 800 + (speedFactor * 600);
            oscillator.frequency.setValueAtTime(baseFreq, now);
            // Quick chirp (freq drop) for mechanical feel
            oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.03);

            // Volume
            const volume = 0.1 + (speedFactor * 0.15);
            gainNode.gain.setValueAtTime(volume, now);

            // Duration: 0.08s (slow) down to 0.03s (fast) - shorter to prevent overlap
            const duration = 0.08 - (speedFactor * 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(now + duration);
        } catch (e) {
            console.error("Audio error", e);
        }
    }

    public playSuccess() {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (ctx.state === 'suspended') ctx.resume();

            const playNote = (freq: number, time: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.1, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + duration);
            };

            const now = ctx.currentTime;
            // Major triad arpeggio (C5, E5, G5, C6)
            playNote(523.25, now, 0.1);       // C5
            playNote(659.25, now + 0.1, 0.1); // E5
            playNote(783.99, now + 0.2, 0.1); // G5
            playNote(1046.50, now + 0.3, 0.4);// C6
        } catch (e) {
            console.error("Audio error", e);
        }
    }

    public playFailure() {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error("Audio error", e);
        }
    }
    public playTypeError() {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            // Low pitch "thud"
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.1);

            // Short and sharp
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio error", e);
        }
    }
}


export const soundManager = new SoundManager();
