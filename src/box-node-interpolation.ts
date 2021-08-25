import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { interpolate } from "../lib/vector2";
import { InterpolatableBoxNode } from "./interpolatable-node";
import { interpolateStyle } from "./style-interpolation";


export function interpolateNodeDefault<B extends BoxNode>(from: B, to: B, t: number): B {
	let lerped: B = { ...from };
	lerped.position = interpolate(from.position, to.position, t);
	if ("style" in from && "style" in to) {
		lerped.style = interpolateStyle(from.style, to.style, t)
	}
	return lerped;
}

//which function should be invoked, from.interpolate or to.interpolate?
type LerpFuncPriority = "from" | "to";

export const interpolateNode = (prio: LerpFuncPriority) => <B extends InterpolatableBoxNode>(from: B, to: B, t: number): BoxNode => {
	const [f1, f2] = [from.interpolate, to.interpolate];
	const [l1, l2] = prio === "from" ? [f1, f2] : [f2, f1];
	if (l1){
		return from.interpolate(from, to, t);
	}
	if (l2){
		return to.interpolate(from, to, t);
	}
	return interpolateNodeDefault(from, to, t);
};