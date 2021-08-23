import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { interpolate } from "../lib/vector2";
import { interpolateStyle } from "./style-interpolation";


export function interpolateNode<B extends BoxNode>(from: B, to: B, t: number): B {
	let lerped: B = { ...from };
	lerped.position = interpolate(from.position, to.position, t);
	if ("style" in from && "style" in to) {
		lerped.style = interpolateStyle(from.style, to.style, t)
	}
	return lerped;
}