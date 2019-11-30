
export const normalize = (min: number, max: number, t: number) => (t - min) / (max - min);
export const clamp01 = (t: number) => {
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
};
export const normalizeClamped = (min: number, max: number, t: number) => clamp01(normalize(min, max, t));
export const interpolate = (a: number, b: number, t: number) => a + (b - a) * t;

export const normSine = (t: number) => Math.sin((t - 0.5)*  Math.PI) * 0.5 + 0.5;
export const upDownSin = (t: number) => Math.sin(t * 2 * Math.PI - (Math.PI / 2)) * 0.5 + 0.5;