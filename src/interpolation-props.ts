import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { WithId } from "../lib/with-id";

export type InterpolationFunc<B> = (from: B, to: B, t: number) => B;
type BoxNodeWithId = WithId<BoxNode>;
export type InterpolationContext = {
	srcNode: BoxNodeWithId,
	targetNode: BoxNodeWithId
};
export type FadeFunc<B> = (node: B, t: number, context: InterpolationContext) => B;

export type InterpolationProps<B> = ({ id?: string } | { isIdLessTree?: true }) & {
	interpolate?: InterpolationFunc<B>,
	fadeIn?: FadeFunc<B>,
	fadeOut?: FadeFunc<B>
};

export type WithInterpolationProps<A, B> = A & InterpolationProps<B>;