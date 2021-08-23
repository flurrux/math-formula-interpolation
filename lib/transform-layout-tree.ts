import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { Predicate } from "fp-ts/lib/Predicate";
import { getLayoutChildPaths } from "./get-child-nodes";
import { isMathListLayout, isMatrixLayout } from "./type-guards";

type TransformFunc<B extends BoxNode> = (node: B) => B;

export const transformEachLayoutChild = (func: TransformFunc<BoxNode>) => <R extends BoxNode>(root: R): R => {
	root = { ...root };
	if (isMathListLayout(root) || isMatrixLayout(root)){
		root.items = root.items.map(func);
	}
	else {
		const childPaths = getLayoutChildPaths(root);
		for (const childPath of childPaths){
			if (childPath.length > 1) continue;
			const childKey = childPath[0];
			if (!root[childKey]) continue;
			root[childKey] = func(root[childKey]);
		}
	}
	return root;
};

export const transformLayoutTree = (func: TransformFunc<BoxNode>) => (skipBranch: Predicate<BoxNode>) => <R extends BoxNode>(root: R): R => {
	if (skipBranch(root)) return root;
	root = func(root) as R;
	root = transformEachLayoutChild(transformLayoutTree(func)(skipBranch))(root);
	return root;
};