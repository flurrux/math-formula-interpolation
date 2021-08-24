import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { Predicate } from "fp-ts/lib/Predicate";
import { getLayoutChildNodes } from "../lib/get-child-nodes";


export const flattenLayoutTree = (selectionFunc: Predicate<BoxNode>, skipSubTree: Predicate<BoxNode>) => (layoutRoot: BoxNode): BoxNode[] => {
	if (selectionFunc(layoutRoot)) return [layoutRoot];
	if (skipSubTree(layoutRoot)) return [];
	
	const childNodes = getLayoutChildNodes(layoutRoot) as BoxNode[];
	return flatten(
		childNodes.map(flattenLayoutTree(selectionFunc, skipSubTree))
	);
};