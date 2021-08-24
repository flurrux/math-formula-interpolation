import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { transformWithFormulaNode } from "../lib/transform-with-formula-node";
import { isFraction, isRoot } from "../lib/type-guards";

function transferId<B extends BoxNode>(formulaNode: FormulaNode, layoutNode: B): B {
	layoutNode = {...layoutNode};
	const { id } = formulaNode;
	if (id) layoutNode.id = id;

	if (isFraction(formulaNode)){
		const { ruleId } = formulaNode;
		if (ruleId){
			layoutNode.rule = {
				...layoutNode.rule,
				id: ruleId
			};
		} 
	}
	else if (isRoot(formulaNode)) {
		const { radicalId } = formulaNode;
		if (radicalId){
			layoutNode.radical = {
				...layoutNode.radical,
				id: radicalId
			};
		} 
	}

	return layoutNode;
}

export const transferIds = transformWithFormulaNode(transferId);