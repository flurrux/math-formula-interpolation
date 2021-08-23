
export const logReturn = (msg: string = "") => <T>(t: T): T => {
	console.log(msg, t);
	return t;
};