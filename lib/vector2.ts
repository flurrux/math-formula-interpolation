
export type Vector2 = [number, number];

export const add = (a: Vector2, b: Vector2) : Vector2 => [a[0] + b[0], a[1] + b[1]];
export const subtract = (a: Vector2, b: Vector2) : Vector2 => [a[0] - b[0], a[1] - b[1]];
export const scale = (vector: Vector2, scalar: number) : Vector2 => [ vector[0] * scalar, vector[1] * scalar ];
export const fromTo = (a: Vector2, b: Vector2) : Vector2 => subtract(b, a);
export const interpolate = (a: Vector2, b: Vector2, t: number) : Vector2 => add(a, scale(subtract(b, a), t));