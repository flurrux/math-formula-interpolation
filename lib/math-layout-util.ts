
import { BoxNode, FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assoc, assocPath, lensPath, pipe, range, view } from 'ramda';
import { add as addVectors, subtract as subVectors, Vector2, flip as flipVec } from '../lib/vector2';
import { PropertyPath } from './types';

type PredicateFunc<T> = (t: T) => boolean;
type MathNode = FormulaNode | BoxNode;

const viewPath = (path: PropertyPath) => view(lensPath(path));



//traversal #####

const generateArrayItemPaths = (arrayProp: string, array: any[]) : [string, number][] => {
    return range(0, array.length).map((ind: number) => [arrayProp, ind]);
};
const getChildPathsUnfiltered = (node: MathNode) : (string | number)[][] => {
    const type = node.type;
    if (["mathlist", "matrix"].includes(type)) return generateArrayItemPaths("items", (node as any).items);
    else if (type === "fraction") return [["numerator"], ["denominator"], ["rule"]];
    else if (type === "root") return [["radical"], ["radicand"], ["index"]];
    else if (type === "script") return [["nucleus"], ["sup"], ["sub"]];
    else if (type === "delimited") return [["delimited"], ["leftDelim"], ["rightDelim"]];
    else if (type === "accented") return [["nucleus"], ["accent"]];
    return [];
};
export const getChildPaths = (node: MathNode): (string | number)[][] => {
    return getChildPathsUnfiltered(node).filter(path => viewPath(path)(node) !== undefined);
};


export const findInMathTree = (findFunc: PredicateFunc<MathNode>) => ((parentNode: MathNode) : PropertyPath => {
    if (findFunc(parentNode)){
        return [];
    }
    const childPaths : PropertyPath[] = getChildPaths(parentNode);
    for (const childPath of childPaths){
        const childNode = viewPath(childPath)(parentNode) as MathNode;
        const findingInChildTree = findInMathTree(findFunc)(childNode);
        if (findingInChildTree){
            return [...childPath, ...findingInChildTree];
        }
    }
    return null;
});



//node modification #######

export const setColor = (color: string) => assocPath(["style", "color"], color);
export const setPosition = (position: Vector2) : ((node: BoxNode) => BoxNode) => assoc("position", position);
export const movePosition = (deltaPosition: Vector2) => ((node: BoxNode) : BoxNode => {
    return setPosition(addVectors(node.position, deltaPosition))(node);
});

export const globalizePositions = (node: BoxNode) : BoxNode => {
    const childPaths = getChildPaths(node);
    if (childPaths === undefined) return node;
    for (const path of childPaths){
        const child = viewPath(path)(node) as BoxNode;
        if (child === undefined) continue;
        const newChild = pipe(movePosition(node.position), globalizePositions)(child);
        node = assocPath(path, newChild)(node) as BoxNode;
    }
    return node;
};

const mapFormulaTreeSub = (map: ((node: BoxNode) => BoxNode), node: BoxNode) => {
    const childPaths = getChildPaths(node);
    if (childPaths === undefined) return map(node);

    let childrenOnlyObj = {};
    for (const path of childPaths){
        const child = viewPath(path)(node) as BoxNode;
        if (child === undefined) continue;
        const newChild = mapFormulaTreeSub(map, child);
        childrenOnlyObj = assocPath(path, newChild)(childrenOnlyObj);
    }

    return {
        ...map(node),
        ...childrenOnlyObj
    };
};
export const mapFormulaTree = (map: ((node: BoxNode) => BoxNode)) => ((node: BoxNode) => mapFormulaTreeSub(map, node));

export const translateGlobalPositionedFormulaTree = (translation: Vector2) => mapFormulaTree(movePosition(translation));

export const alignSubNodeToGlobalPosition = (position: Vector2, path: PropertyPath, normalizedAnchor: Vector2 = [0.5, 0]) => ((node: BoxNode) => {
    const subNode = viewPath(path)(node) as BoxNode;
    const subNodePosition = addVectors(subNode.position, [
        subNode.dimensions.width * normalizedAnchor[0],
        (normalizedAnchor[1] > 0 ? subNode.dimensions.yMax : subNode.dimensions.yMin) * normalizedAnchor[1]
    ])
    const delta = subVectors(position, subNodePosition);
    return translateGlobalPositionedFormulaTree(delta)(node);
});
export const alignSubNodeToGlobalX = (x: number, path: PropertyPath) => ((node: BoxNode) => {
    const subNode = viewPath(path)(node) as BoxNode;
    const delta = x - subNode.position[0];
    return translateGlobalPositionedFormulaTree([delta, 0])(node);
});



export const getOriginPoint = (formula: FormulaNode, layoutedFormula: BoxNode) => {
	const findOriginMarkerPath = (parentNode: FormulaNode, currentPath: PropertyPath) => {
		if ((parentNode as any).globalOrigin){
			return currentPath;
		}
		const childPaths = getChildPaths(parentNode);
		for (const childPath of childPaths){
			const childNode = viewPath(childPath)(parentNode) as FormulaNode;
			const totalChildPath = [...currentPath, ...childPath];
			const subPath = findOriginMarkerPath(childNode, totalChildPath);
			if (subPath){
				return totalChildPath;
			}
		}
	};
	const path = findOriginMarkerPath(formula, []);
	if (!path) return;

	const formulaNode = viewPath(path)(formula) as FormulaNode;
	const origin = (formulaNode as any).globalOrigin;
	const boxNode = viewPath(path)(layoutedFormula) as BoxNode;
	const dim = boxNode.dimensions;
	const localPoint: Vector2 = [
		dim.width * origin[0],
		(origin[1] > 0 ? dim.yMax : dim.yMin) * origin[1]
	];
	return addVectors(boxNode.position, localPoint);
};
//the root-position of layouted must be [0, 0] and every node must have a global position
export const alignToMarkedSubNode = (formula: FormulaNode) => ((layouted: BoxNode) : BoxNode => {
    const originPoint = getOriginPoint(formula, layouted);
    if (!originPoint) return layouted;
    return translateGlobalPositionedFormulaTree(flipVec(originPoint))(layouted);
});

const getUniqueIdOfNode = (node: any) => node.uniqueId || (typeof(node.corrId) === "string" ? node.corrId : undefined);
const hasNodeId = (id: string) => ((node: FormulaNode) => id === getUniqueIdOfNode(node));
export const lookUpPathById = (id: string, formula: FormulaNode) : PropertyPath => findInMathTree(hasNodeId(id))(formula);