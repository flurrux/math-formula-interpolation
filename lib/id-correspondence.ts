import { FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assoc, lensPath, view } from 'ramda';
import { PropertyPath } from '../lib/types';
import { NodeInterpolationSpec } from '../src/interpolate-formula';
import { getChildPaths } from './math-layout-util';

export type IdPathMap = { [key: string]: PropertyPath[] };

const isLeafNode = (node: FormulaNode): boolean => ["ord", "op", "bin", "rel", "open", "close", "punct"].includes(node.type);

const traverseFormulaTree = (forEachFunc: ((node: FormulaNode) => void), node: FormulaNode) => {
	if (isLeafNode(node)) {
		forEachFunc(node);
	}
	else {
		const childPaths = [];
		for (const childPath of childPaths) {
			const childNode = view(lensPath(childPath))(node);
			traverseFormulaTree(forEachFunc, childNode);
		}
	}
};


const getIdOfNode = (node: any) => node.branchId || node.id;
const collectIdsSub = (idMap: IdPathMap, currentPath: PropertyPath, node: FormulaNode): IdPathMap => {
	if (isLeafNode(node)) {
		const id = getIdOfNode(node);
		if (id !== undefined) {
			idMap = assoc(id, [...(idMap[id] || []), currentPath], idMap);
		}
	}
	else {
		const childPaths = getChildPaths(node);
		for (const childPath of childPaths) {
			const childNode = view(lensPath(childPath))(node);
			idMap = collectIdsSub(idMap, [...currentPath, ...childPath], childNode);
		}
	}
	return idMap;
};
export const collectIds = (node: FormulaNode): IdPathMap => collectIdsSub({}, [], node);

const generateNodeInterpolationSpecByIds = (from: FormulaNode, to: FormulaNode): {} => {
	const fromIdMap = collectIds(from);
	const toIdMap = collectIds(to);
	const ids = Reflect.ownKeys(fromIdMap) as string[];
	
	const spec = [];
	for (const id of ids) {
		const fromPaths = fromIdMap[id];
		const toPaths = toIdMap[id];

		//this is a double-loop because it's easier than to write out all the cases
		//case 1: single -> single
		//case 2: single -> multiple (branching)
		//case 3: multiple -> single (merging)
		for (let i = 0; i < fromPaths.length; i++) {
			for (let j = 0; j < toPaths.length; j++) {
				spec.push({
					from: fromPaths[i],
					to: toPaths[j]
				});
			}
		}
	}
	return spec;
};