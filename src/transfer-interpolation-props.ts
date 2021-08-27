import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { transformWithFormulaNode } from "../lib/transform-with-formula-node";
import { isFraction, isRoot } from "../lib/type-guards";

const interpolationPropKeys: string[] = [
	"id", "interpolate", "fadeIn", "fadeOut"
];

function transferInterpolationProps<B extends BoxNode>(formulaNode: FormulaNode, layoutNode: B): B {
	layoutNode =  {...layoutNode };

	for (const key of interpolationPropKeys){
		const prop = formulaNode[key];
		if (prop === undefined) continue;
		layoutNode[key] = prop;
	}

	if (isFraction(formulaNode)){
		const { ruleProps } = formulaNode;
		if (ruleProps){
			layoutNode.rule = {
				...layoutNode.rule,
				...ruleProps
			};
		} 
	}
	else if (isRoot(formulaNode)) {
		const { radicalProps } = formulaNode;
		if (radicalProps){
			layoutNode.radical = {
				...layoutNode.radical,
				...radicalProps
			};
		} 
	}

	return layoutNode;
}

export const transferAllInterpolationProps = transformWithFormulaNode(transferInterpolationProps);