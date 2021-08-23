import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { interpolate } from "../lib/linear-mapping";
import { add, Vector2, interpolate as lerpVec } from "../lib/vector2";

const fadeNode = (positionDeltas: [Vector2, Vector2], alphas: [number, number]) => (t: number) => <B extends BoxNode>(node: B,): B => {
	return {
		...node,
		position: add(
			node.position,
			lerpVec(positionDeltas[0], positionDeltas[1], t),
		),
		alpha: interpolate(alphas[0], alphas[1], t)
	}
};

export const fadeInNode = fadeNode([[0, 20], [0, 0]], [0, 1]);
export const fadeOutNode = fadeNode([[0, 0], [0, -20]], [1, 0]);