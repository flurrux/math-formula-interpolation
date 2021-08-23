
export function waitMillis(millis: number){
	return new Promise((resolve) => {
		window.setTimeout(resolve, millis);
	})
}