
type Easing = (t: number) => number;

export interface Animation {
	stop: () => void,
	onFinished: Promise<unknown>
};
export type AnimateCallback = (progress: number, elapsedTime: number) => void;
export const animationSettings: { deltaTime: string | number } = {
	deltaTime: "realtime"
};
export const animate = (duration: number, onAnimate: AnimateCallback, easing: Easing = ((t: number) => t)): Animation => {
	let stopAnim = () => {};
	const finishedPromise = new Promise((resolve, reject) => {
		const startTime = Date.now();
		let curTime = startTime;
		let running = true;
		stopAnim = () => running = false;
		const loop = () => {
			if (!running){
				resolve(null);
				return;
			}
			const curDeltaTime = typeof(animationSettings.deltaTime) === "string" ? (Date.now() - curTime) : animationSettings.deltaTime;
			curTime += curDeltaTime;
			const elapsedTime = curTime - startTime;
			const progress = elapsedTime / duration;
			const smoothedProgress = easing(Math.min(1, progress));
            onAnimate(smoothedProgress, elapsedTime);
            if (progress >= 1){
                resolve(null);
                return;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
	});
	return {
		stop: stopAnim,
		onFinished: finishedPromise
	};
};

export const wait = (duration: number): Animation => {
	return animate(duration, () => {});
};

type LoopCallbackFunction = (dt: number, t: number) => void;
export const createLoop = (onLoop: LoopCallbackFunction) => {
	let accumTime = 0;
	let prevTime = 0;
	const minDeltaTime = 0.01;

	let running: boolean = true;
	let currentRequestId = -1;
	const loop = () => {
		const curTime = Date.now();
		const dt = Math.max(minDeltaTime, (curTime - prevTime) / 1000);
		prevTime = curTime;
		if (running){
			accumTime += dt;
			onLoop(dt, accumTime);
		}
		currentRequestId = window.requestAnimationFrame(loop);
	};
	const stop = () => {
		window.cancelAnimationFrame(currentRequestId);
	};
	const pause = () => {
		running = false;
	};
	const resume = () => {
		running = true;
	};
	const start = () => {
		prevTime = Date.now() - 0.015;
		loop();
	};
	return {
		pause, resume, 
		start, stop
	};
};