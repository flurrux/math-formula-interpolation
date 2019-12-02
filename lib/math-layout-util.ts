
import { BoxNode, FormulaNode } from '@flurrux/math-layout-engine/src/types';
import { assoc, assocPath, lensPath, pipe, range, view } from 'ramda';
import { add as addVectors, subtract as subVectors, Vector2 } from '../lib/vector2';
import { PropertyPath } from './types';

const viewPath = (path: PropertyPath) => view(lensPath(path));

const generateArrayItemPaths = (arrayProp: string, array: any[]) : [string, number][] => {
    return range(0, array.length).map((ind: number) => [arrayProp, ind]);
};
export const getChildPaths = (node: FormulaNode | BoxNode) : (string | number)[][] => {
    const type = node.type;
    if (["mathlist", "matrix"].includes(type)) return generateArrayItemPaths("items", (node as any).items);
    else if (type === "fraction") return [["numerator"], ["denominator"], ["rule"]];
    else if (type === "root") return [["radical"], ["radicand"], ["index"]];
    else if (type === "script") return [["nucleus"], ["sup"], ["sub"]];
    else if (type === "delimited") return [["delimited"], ["leftDelim"], ["rightDelim"]];
    else if (type === "accented") return [["nucleus"], ["accent"]];
};

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