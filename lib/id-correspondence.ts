import { FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assoc, lensPath, view, assocPath, range } from 'ramda';
import { PropertyPath } from '../lib/types';
import { NodeInterpolationSpec } from '../src/interpolate-formula';

export interface IdPathMap { 
	[id: string]: {
		path: PropertyPath,
		uniqueId: string
	}[]
};

const generateArrayItemPaths = (arrayProp: string, array: any[]): [string, number][] => {
	return range(0, array.length).map((ind: number) => [arrayProp, ind]);
};
const getChildPaths = (node: FormulaNode): (string | number)[][] => {
	const type = node.type;
	if (["mathlist", "matrix"].includes(type)) return generateArrayItemPaths("items", (node as any).items);
	else if (type === "fraction") return [["numerator"], ["denominator"]];
	else if (type === "root") return [["radicand"], ["index"]];
	else if (type === "script") return [["nucleus"], ["sup"], ["sub"]];
	else if (type === "delimited") return [["delimited"], ["leftDelim"], ["rightDelim"]];
	else if (type === "accented") return [["nucleus"], ["accent"]];
};

const isLeafNode = (node: FormulaNode): boolean => ["ord", "op", "bin", "rel", "open", "close", "punct"].includes(node.type);

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


const getUniqueIdOfNode = (node: any) => node.branchId || node.id;
const collectIdsSub = (idMap: IdPathMap, currentPath: PropertyPath, node: FormulaNode): IdPathMap => {
	if (isLeafNode(node)) {
		const id = (node as any).id;
		if (id !== undefined) {
			idMap = assocPath([id, idMap[id] ? idMap[id].length : 0], { 
					path: currentPath, uniqueId: getUniqueIdOfNode(node) 
				}, idMap);
		}
	}
	else {
		const childPaths = getChildPaths(node);
		for (const childPath of childPaths) {
			const childNode = view(lensPath(childPath))(node) as FormulaNode;
			idMap = collectIdsSub(idMap, [...currentPath, ...childPath], childNode);
		}
	}
	return idMap;
};
export const collectIds = (node: FormulaNode): IdPathMap => collectIdsSub({}, [], node);
