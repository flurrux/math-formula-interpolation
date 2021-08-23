export const normSine = (t: number) => Math.sin((t - 0.5) * Math.PI) * 0.5 + 0.5;
export const upDownSin = (t: number) => Math.sin(t * 2 * Math.PI - (Math.PI / 2)) * 0.5 + 0.5;