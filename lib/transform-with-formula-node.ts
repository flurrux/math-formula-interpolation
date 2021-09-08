import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { getFormulaChildPaths } from "./get-child-nodes";
import { isMathList, isMatrix } from './type-guards';

type TransformFunc<B extends BoxNode> = (formulaNode: FormulaNode, boxNode: B) => B;

export const transformWithFormulaNode = <B extends BoxNode>(transformFunc: TransformFunc<B>) => (formulaNode: FormulaNode) => (boxNode: B): B => {
	boxNode = transformFunc(formulaNode, boxNode);
	const subT = transformWithFormulaNode(transformFunc);
	if (isMathList(formulaNode) || isMatrix(formulaNode)){
		boxNode.items = formulaNode.items.map(
			(formularChild, j) => subT(formularChild)(boxNode.items[j])
		)
	}
	else {
		const childPaths = getFormulaChildPaths(formulaNode);
		for (const childPath of childPaths){
			if (childPath.length === 1){
				const childKey = childPath[0];
				const formulaChild = formulaNode[childKey];
				const layoutChild = boxNode[childKey];
				if (!formulaChild || !layoutChild) continue;
				boxNode[childKey] = subT(formulaChild)(layoutChild);
			}
		}
	}

	return boxNode;
}