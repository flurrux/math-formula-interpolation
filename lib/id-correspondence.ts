import { FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assocPath, lensPath, range, view } from 'ramda';
import { PropertyPath } from '../lib/types';
import { getChildPaths } from './math-layout-util';

export interface IdPathMap { 
	[id: string]: {
		path: PropertyPath,
		uniqueId: string
	}[]
};

const generateArrayItemPaths = (arrayProp: string, array: any[]): [string, number][] => {
	return range(0, array.length).map((ind: number) => [arrayProp, ind]);
};

const isLeafNode = (node: FormulaNode): boolean => ["ord", "op", "bin", "rel", "open", "close", "punct", "rule"].includes(node.type);

const traverseFormulaTree = (forEachFunc: ((node: FormulaNode) => void), node: FormulaNode) => {
	if (isLeafNode(node)) {
		forEachFunc(node);
	}
	else {
		const childPaths = [];
		for (const childPath of childPaths) {
			const childNode = view(lensPath(childPath))(node) as FormulaNode;
			traverseFormulaTree(forEachFunc, childNode);
		}
	}
};


const collectIdsSub = (idMap: IdPathMap, isFrom: boolean, currentPath: PropertyPath, node: FormulaNode): IdPathMap => {
	if (isLeafNode(node)) {
		const corrId = (node as any).corrId;
		if (corrId !== undefined) {
			const id = Array.isArray(corrId) ? corrId[isFrom ? 1 : 0] : corrId;
			idMap = assocPath([id, idMap[id] ? idMap[id].length : 0], { 
				path: currentPath, uniqueId: ((node as any).uniqueId ||id)
			}, idMap);
		}
	}
	else {
		const childPaths = getChildPaths(node);
		for (const childPath of childPaths) {
			const childNode = view(lensPath(childPath))(node) as FormulaNode;
			idMap = collectIdsSub(idMap, isFrom, [...currentPath, ...childPath], childNode);
		}
	}
	return idMap;
};
export const collectIds = (node: FormulaNode, isFrom: boolean): IdPathMap => collectIdsSub({}, isFrom, [], node);
