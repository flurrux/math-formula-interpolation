import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { interpolate } from "../lib/vector2";
import { InterpolatableBoxNode } from "./interpolatable-box-node";
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
	const lerpFuncs = prio === "from" ? [f1, f2, interpolateNodeDefault] : [f2, f1, interpolateNodeDefault];
	for (const lerpFunc of lerpFuncs){
		if (!lerpFunc) continue;
		return lerpFunc(from, to, t);
	}
};