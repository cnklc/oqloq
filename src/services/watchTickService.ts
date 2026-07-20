/**
 * Watch Tick Service
 * Synthesizes the ticking of a Swiss automatic watch escapement with the Web
 * Audio API — no audio asset to ship. A mechanical automatic movement beats at
 * 28,800 vph (8 beats per second), producing the characteristic fast, dry hum.
 */

// 28,800 vph / 3600 = 8 beats per second.
const BEATS_PER_SECOND = 8;
const TICK_INTERVAL = 1 / BEATS_PER_SECOND;

// Look-ahead scheduler tuning: schedule ticks a little ahead of the audio clock
// so setInterval throttling (e.g. background tabs) never causes a dropout.
const SCHEDULE_AHEAD = 0.15; // seconds
const LOOKAHEAD_MS = 40;

// Each tick is a very short filtered-noise transient — the escapement click.
const TICK_DURATION = 0.012; // seconds
const TICK_FILTER_HZ = 3200;
const TICK_FILTER_Q = 6;
const DEFAULT_GAIN = 0.18;

type AudioContextClass = typeof AudioContext;

const getAudioContextClass = (): AudioContextClass | null => {
	if (typeof window === "undefined") return null;
	return (
		window.AudioContext ||
		(window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext ||
		null
	);
};

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let schedulerId: number | null = null;
let nextTickTime = 0;
let isTicking = false;

/**
 * A short buffer of white noise, reused for every tick.
 */
const buildNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
	const length = Math.ceil(ctx.sampleRate * TICK_DURATION);
	const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i += 1) {
		data[i] = Math.random() * 2 - 1;
	}
	return buffer;
};

/**
 * Schedule a single escapement click at the given audio-clock time.
 * Odd/even ticks are detuned slightly to give a subtle tick-tock character.
 */
const scheduleTick = (time: number, alternate: boolean): void => {
	if (!audioCtx || !masterGain || !noiseBuffer) return;

	const source = audioCtx.createBufferSource();
	source.buffer = noiseBuffer;

	const filter = audioCtx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = alternate ? TICK_FILTER_HZ * 0.85 : TICK_FILTER_HZ;
	filter.Q.value = TICK_FILTER_Q;

	const env = audioCtx.createGain();
	env.gain.setValueAtTime(0.0001, time);
	env.gain.exponentialRampToValueAtTime(1, time + 0.0008);
	env.gain.exponentialRampToValueAtTime(0.0001, time + TICK_DURATION);

	source.connect(filter);
	filter.connect(env);
	env.connect(masterGain);

	source.start(time);
	source.stop(time + TICK_DURATION);
};

const runScheduler = (): void => {
	if (!audioCtx) return;
	let beat = Math.round(nextTickTime / TICK_INTERVAL);
	while (nextTickTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
		scheduleTick(nextTickTime, beat % 2 === 1);
		nextTickTime += TICK_INTERVAL;
		beat += 1;
	}
};

/**
 * Start the ticking loop. Safe to call repeatedly; the AudioContext is created
 * lazily on first use (must be triggered by a user gesture to satisfy autoplay
 * policies) and resumed if the browser had suspended it.
 */
export const startWatchTick = (): void => {
	if (isTicking) return;

	const AudioCtx = getAudioContextClass();
	if (!AudioCtx) return;

	if (!audioCtx) {
		audioCtx = new AudioCtx();
		masterGain = audioCtx.createGain();
		masterGain.gain.value = DEFAULT_GAIN;
		masterGain.connect(audioCtx.destination);
		noiseBuffer = buildNoiseBuffer(audioCtx);
	}

	void audioCtx.resume();
	isTicking = true;
	nextTickTime = audioCtx.currentTime + 0.05;
	runScheduler();
	schedulerId = window.setInterval(runScheduler, LOOKAHEAD_MS);
};

/**
 * Stop the ticking loop. The AudioContext is kept alive (suspended) so a later
 * restart is instant and avoids re-allocating buffers.
 */
export const stopWatchTick = (): void => {
	if (schedulerId !== null) {
		window.clearInterval(schedulerId);
		schedulerId = null;
	}
	isTicking = false;
	if (audioCtx) void audioCtx.suspend();
};
