import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { getLayoutChildNodes } from "../lib/get-child-nodes";
import { hasId } from "../lib/with-id";


type WithIdLack<T> = T & {
	isIdLessTree: true
};

export const isIdLessTree = (node: BoxNode): boolean => {
	return node.isIdLessTree;
}


//node that are extracted here have the property:
//- no ancestor with an id
//- is the largest possible tree that contains no ids,
//this means that if we would go one node up, there would be at least one id in that tree
//this also means that if this node has sibling nodes, then there is an id in one of the sibling nodes
export function markIdLessTrees(layoutRoot: BoxNode): BoxNode[] {
	return markIdLessTreesSub(layoutRoot).nodes;
}

//like the above function, but also return if just the root-node was returned.
function markIdLessTreesSub<B extends BoxNode>(layoutRoot: B): [B, boolean] {
	if (hasId(layoutRoot)) return [layoutRoot, false];
	const childResults = getLayoutChildNodes(layoutRoot).map(markIdLessTreesSub);
	if (childResults.every(item => item[1])) {
		return [layoutRoot, true];
	}
	return [
		flatten(
			childResults.map(item => item.nodes)
		),
		false
	]
}
