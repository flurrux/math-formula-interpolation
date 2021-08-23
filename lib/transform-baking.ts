import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { transformEachLayoutChild, transformLayoutTree } from "./transform-layout-tree";
import { Vector2, add } from './vector2';
import { hasId } from "./with-id";

type WithGlobalPosition<N> = N & {
	globalPosition: Vector2
};

const getNodePosition = (node: BoxNode): Vector2 => node.position || [0, 0];

const attachGlobalPosition = <B extends BoxNode>(node: B): B => {
	if (!("globalPosition" in node)){
		node = {
			...node,
			globalPosition: node.position || [0, 0] as Vector2
		}
	}
	const globalNodePosition: Vector2 = node.globalPosition;
	node = transformEachLayoutChild(
		(childNode) => ({
			...childNode,
			globalPosition: add(
				globalNodePosition, 
				childNode.position || [0, 0]
			)
		})
	)(node);

	return node;
}

const replaceLocalByGlobalPosition = <B extends BoxNode>(node: B): B => {
	const globalNodePosition = getNodePosition(node);
	return transformEachLayoutChild(
		(childNode) => {
			return {
				...childNode,
				position: add(
					globalNodePosition,
					getNodePosition(childNode)
				)
			}
		}
	)(node);
}

export const attachGlobalPositions = transformLayoutTree(
	attachGlobalPosition
);

export const replacePositionsByGlobal = transformLayoutTree(
	replaceLocalByGlobalPosition
)(hasId);