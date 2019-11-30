
import { Style } from '@flurrux/math-layout-engine/src/style';
import { BoxNode, FormulaNode, Dimensions } from '@flurrux/math-layout-engine/src/types';
import { identity, fromPairs, lensPath, view, assoc } from 'ramda';
import { interpolate } from '../lib/util';
import { interpolate as lerpVectors } from '../lib/vector2';
import { mapFormulaTree, getChildPaths } from '../lib/math-layout-util';
import { PropertyPath } from '../lib/types';

type InterpolatableNodeType = "char" | "text" | "contours" | "rule";
interface InterpolatableNode extends BoxNode {
    type: InterpolatableNodeType
}
interface NodeInterpolation extends BoxNode {
    type: InterpolatableNodeType
};
type FormulaInterpolation = NodeInterpolation[];

type NodeInterpolationFunc = (from: BoxNode, to: BoxNode, t: number) => BoxNode;
interface NodeInterpolationMap {
    from: BoxNode, to: BoxNode,
    interpolate: NodeInterpolationFunc
};
type FormulaInterpolationMap = NodeInterpolationMap[];

type NodePath = (((string | number)[]) | (string | number))[];
type NodeIdSpec = string | NodePath | BoxNode;
type NodeInterpolationSpec = {
    from: NodeIdSpec, to: NodeIdSpec,
    interpolate?: NodeInterpolationFunc
} | { id: string, interpolate?: NodeInterpolationFunc }



const isLeafNode = (node: FormulaNode) : boolean => ["ord", "op", "bin", "rel", "open", "close", "punct"].includes(node.type);
const traverseFormulaTree = (forEachFunc: ((node: FormulaNode) => void), node: FormulaNode) => {
    if (isLeafNode(node)){
        forEachFunc(node);
    }
    else {
        const childPaths = [];
        for (const childPath of childPaths){
            const childNode = view(lensPath(childPath))(node);
            traverseFormulaTree(forEachFunc, childNode);
        }
    }
};

const getIdOfNode = (node: any) => node.branchId || node.id;
type IdPathMap = { [key: string]: PropertyPath[] };
const generateNodeInterpolationSpecByIds = (from: FormulaNode, to: FormulaNode) : NodeInterpolationSpec[] => {
    const collectIds = (node: FormulaNode) : IdPathMap => collectIdsSub({}, [], node);
    const collectIdsSub = (idMap: IdPathMap, currentPath: PropertyPath, node: FormulaNode) : IdPathMap  => {
        if (isLeafNode(node)){
            const id = getIdOfNode(node);
            if (id !== undefined){
                idMap = assoc(id, [...(idMap[id] || []), currentPath], idMap);
            }
        }
        else {
            const childPaths = [];
            for (const childPath of childPaths){
                const childNode = view(lensPath(childPath))(node);
                idMap = collectIdsSub(idMap, [...currentPath, ...childPath], childNode);
            }
        }
        return idMap;
    };

    const fromIdMap = collectIds(from);
    const toIdMap = collectIds(to);

    const ids = Reflect.ownKeys(fromIdMap) as string[];
    const spec = [];
    for (const id of ids){
        const fromPaths = fromIdMap[id];
        const toPaths = toIdMap[id];

        for (let i = 0; i < fromPaths.length; i++){
            for (let j = 0; j < toPaths.length; j++){
                spec.push({
                    from: fromPaths[i],
                    to: toPaths[j]
                });
            }
        }
    }
    return spec;
};
const normalizeFormulaInterpolationSpec = (spec: NodeInterpolationSpec[]) : FormulaInterpolationMap => null;



const interpolateCssColors = (a: string, b: string, t: number) : string => a;
const interpolateStyles = (a: Style, b: Style, t: number) : Style => identity({
    ...a,
    fontSize: interpolate(a.fontSize, b.fontSize, t),
    color: interpolateCssColors(a.color, b.color, t)
});
const interpolateDimensions = (a: Dimensions, b: Dimensions, t: number) : Dimensions => {
    return fromPairs(["width", "yMin", "yMax"].map(prop => [prop, interpolate(a[prop], b[prop], t)]));
};
const interpolateNodes = (a: InterpolatableNode, b: InterpolatableNode, t: number) : NodeInterpolation => {
    return {
        ...a,
        style: interpolateStyles(a.style, b.style, t),
        position: lerpVectors(a.position, b.position, t),
        dimensions: interpolateDimensions(a.dimensions, b.dimensions, t)
    }
};


