
export const animate = (duration: number, animFunc: ((t: number) => void)) => {
	const startTime = Date.now();
	const loop = () => {
		const relTime = Date.now() - startTime;
		const normTime = relTime / duration;
		const stop = normTime >= 1;
		animFunc(Math.min(1, normTime));
		if (stop) return;
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};