import { FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assoc, lensPath, view, assocPath, range } from 'ramda';
import { PropertyPath } from '../lib/types';
import { NodeInterpolationSpec } from '../src/interpolate-formula';
import { viewPath } from './util';

export interface IdPathMap { 
	[id: string]: {
		path: PropertyPath,
		uniqueId: string
	}[]
};

const generateArrayItemPaths = (arrayProp: string, array: any[]): [string, number][] => {
	return range(0, array.length).map((ind: number) => [arrayProp, ind]);
};
const getChildPathsUnfiltered = (node: FormulaNode): (string | number)[][] => {
	const type = node.type;
	if (["mathlist", "matrix"].includes(type)) return generateArrayItemPaths("items", (node as any).items);
	else if (type === "fraction") return [["numerator"], ["denominator"], ["rule"]];
	else if (type === "root") return [["radicand"], ["index"]];
	else if (type === "script") return [["nucleus"], ["sup"], ["sub"]];
	else if (type === "delimited") return [["delimited"], ["leftDelim"], ["rightDelim"]];
	else if (type === "accented") return [["nucleus"], ["accent"]];
	return [];
};
const getChildPaths = (node: FormulaNode): (string | number)[][] => getChildPathsUnfiltered(node).filter(path => viewPath(path)(node) !== undefined);

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


const getUniqueIdOfNode = (node: any) => node.branchId || node.id;
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
