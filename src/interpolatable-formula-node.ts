import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";

type NodeId = string | undefined;

type InterpolationFunc<B extends InterpolatableBoxNode> = (from: B, to: B, t: number) => B;
type InterpolationContext = {
	srcNodes: BoxNode[],
	targetNodes: BoxNode[]
};
type FadeFunc<B extends InterpolatableBoxNode> = (node: B, t: number, context: InterpolationContext) => B;

type InterpolationProps<B extends InterpolatableBoxNode> = {
	id: NodeId,
	interpolate?: InterpolationFunc<B>,
	fadeIn?: FadeFunc<B>,
	fadeOut?: FadeFunc<B>
};

type InterpolatableBoxNode<B extends BoxNode> = B & InterpolationProps<B>;


//formula-nodes ###

// type Interpolatable

type InterpolatableFormulaNode<B extends InterpolatableBoxNode> = FormulaNode & {
	id: NodeId,
	interpolate?: InterpolationFunc<B>,
	fadeIn?: FadeFunc<B>,
	fadeOut?: FadeFunc<B>
};