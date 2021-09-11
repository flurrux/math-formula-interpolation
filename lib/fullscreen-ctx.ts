
export function setupFullScreenCtx(){
	document.body.insertAdjacentHTML("beforeend", "<canvas></canvas>");
	const canvas = document.body.querySelector("canvas");
	Object.assign(canvas, {
		width: window.innerWidth,
		height: window.innerHeight
	});
	return canvas.getContext("2d");
}