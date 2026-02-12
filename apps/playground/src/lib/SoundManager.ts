export class SoundManager {
    private context: AudioContext | null = null;
    private enabled: boolean = true;

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

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            // Randomize pitch slightly for mechanical feel
            oscillator.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.05);
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
}

export const soundManager = new SoundManager();
