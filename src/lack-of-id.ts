import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { pipe } from "fp-ts/lib/function";
import { getLayoutChildNodes } from "../lib/get-child-nodes";
import { transformEachLayoutChild } from "../lib/transform-layout-tree";
import { hasId } from "../lib/with-id";


export const isIdLessTree = (node: BoxNode): boolean => {
	return node.isIdLessTree;
}
const addIdLessTreeFlag = <B extends BoxNode>(node: B): B => {
	return { 
		...node, 
		isIdLessTree: true
	};
}
const removeIdLessTreeFlag = <B extends BoxNode>(node: B): B => {
	node = { ...node };
	delete node.isIdLessTree;
	return node;
}


//node that are extracted here have the property:
//- no ancestor with an id
//- is the largest possible tree that contains no ids,
//this means that if we would go one node up, there would be at least one id in that tree
//this also means that if this node has sibling nodes, then there is an id in one of the sibling nodes
export function markIdLessTrees(layoutRoot: BoxNode): BoxNode {
	if (hasId(layoutRoot)) return layoutRoot;

	layoutRoot = transformEachLayoutChild(markIdLessTrees)(layoutRoot);

	const childNodes = getLayoutChildNodes(layoutRoot);
	//if every child turns out to be without id and the parent is also without id, 
	//then in order to get the least number of flat id-less nodes, we only mark the parent as `idLessTree`
	if (childNodes.every(isIdLessTree)) {
		return pipe(
			layoutRoot,
			transformEachLayoutChild(removeIdLessTreeFlag),
			addIdLessTreeFlag
		);
	}
	return layoutRoot;
}

