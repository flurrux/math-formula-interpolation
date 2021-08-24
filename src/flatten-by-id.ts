import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { constant } from "fp-ts/lib/function";
import { or } from "fp-ts/lib/Predicate";
import { getLayoutChildNodes } from "../lib/get-child-nodes";
import { hasId, WithId } from "../lib/with-id";
import { flattenLayoutTree } from "./flatten-layout-tree";
import { isTopLevelFlatNode } from "./top-level-flat-node";
import { isIdLessTree } from "./lack-of-id";

type BoxNodeWithId = WithId<BoxNode>;

export const flattenById = flattenLayoutTree(hasId, constant(false));


//functions to check if there are any nested nodes with ids

function hasAnyIdNodes(layoutRoot: BoxNodeWithId): boolean {
	if (hasId(layoutRoot)) return true;
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNodeWithId[];
	return childNodes.some(hasAnyIdNodes);
}
function hasNestedIdNodes(layoutRoot: WithId<BoxNode>): boolean {
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNodeWithId[];
	if (hasId(layoutRoot)) {
		return childNodes.some(hasAnyIdNodes);
	}
	return childNodes.some(hasNestedIdNodes);
}

export const flattenByIdOrLackOfId = flattenLayoutTree(
	isTopLevelFlatNode, constant(false)
);