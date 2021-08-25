import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { interpolate } from "../lib/linear-mapping";
import { add, Vector2, interpolate as lerpVec } from "../lib/vector2";
import { InterpolatableBoxNode } from "./interpolatable-node";
import { InterpolationContext } from "./interpolation-props";

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

const fadeInNodeDefault = fadeNode([[0, 20], [0, 0]], [0, 1]);
const fadeOutNodeDefault = fadeNode([[0, 0], [0, -20]], [1, 0]);

export const fadeInNode = (context: InterpolationContext) => (t: number) => (node: InterpolatableBoxNode): BoxNode => {
	if (node.fadeIn) return node.fadeIn(node, t, context);
	return fadeInNodeDefault(t)(node);
};
export const fadeOutNode = (context: InterpolationContext) => (t: number) => (node: InterpolatableBoxNode): BoxNode => {
	if (node.fadeOut) return node.fadeOut(node, t, context);
	return fadeOutNodeDefault(t)(node);
};