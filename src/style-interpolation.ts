import { Style } from "@flurrux/math-layout-engine/src/style";
import { interpolate } from "../lib/linear-mapping";

export function interpolateStyle<S extends Style>(from: S, to: S, t: number): S {
	return {
		...from,
		fontSize: interpolate(from.fontSize, to.fontSize, t)
	}
}