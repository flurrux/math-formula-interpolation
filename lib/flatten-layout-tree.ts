import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { getLayoutChildNodes } from "./get-child-nodes";
import { hasId, WithId } from "./with-id";

type BoxNodeWithId = WithId<BoxNode>;

//if a node has an id, then it won't be traversed. 
//so any child-node that also has an id will be ignored.
export function flattenById(layoutRoot: BoxNodeWithId): BoxNodeWithId[] {
	if (hasId(layoutRoot)) return [layoutRoot];
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNodeWithId[];
	return flatten(
		childNodes.map(flattenById)
	);
}


function hasAnyIdNodes(layoutRoot: BoxNodeWithId): boolean {
	if (hasId(layoutRoot)) return true;
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNodeWithId[];
	return childNodes.some(hasAnyIdNodes);
}
export function hasNestedIdNodes(layoutRoot: WithId<BoxNode>): boolean {
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNodeWithId[];
	if (hasId(layoutRoot)){
		return childNodes.some(hasAnyIdNodes);
	}
	return childNodes.some(hasNestedIdNodes);
}