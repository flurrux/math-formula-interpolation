
import { Style } from '@flurrux/math-layout-engine/src/style';
import { FormulaNode, BoxNode, Dimensions } from '@flurrux/math-layout-engine/src/types';
import { fromPairs, identity, map, reduce, assocPath } from 'ramda';
import { interpolate, viewPath } from '../lib/util';
import { interpolate as lerpVectors } from '../lib/vector2';
import { collectIds } from '../lib/id-correspondence';
import { PropertyPath } from '../lib/types';

//types #######

type InterpolatableNodeType = "char" | "text" | "contours" | "rule";
interface InterpolatableNode extends BoxNode {
    type: InterpolatableNodeType
}
interface NodeInterpolation extends BoxNode {
    type: InterpolatableNodeType
};
export type FormulaInterpolation = NodeInterpolation[];

type NodeInterpolationFunc = (from: BoxNode, to: BoxNode, t: number) => BoxNode;
interface NodeInterpolationMap {
    from: BoxNode, to: BoxNode,
    interpolate: NodeInterpolationFunc
};
type FormulaInterpolationMap = NodeInterpolationMap[];

type NodeIdSpec = PropertyPath | BoxNode;
//todo: find a way to make this interface either have from and to, or id.
export interface NodeInterpolationSpec {
	from?: NodeIdSpec, to?: NodeIdSpec,
	id?: string,
	interpolate: NodeInterpolationFunc
};

const lookUpBoxNodeByByPathOrNode = (root: BoxNode, idSpec: NodeIdSpec) : BoxNode => {
	return Array.isArray(idSpec) ? viewPath(idSpec as PropertyPath)(root) : (idSpec as BoxNode);
};
export const normalizePathOrNodeSpecEntry = (from: BoxNode, to: BoxNode) => ((entry: NodeInterpolationSpec): NodeInterpolationMap => {
	return {
		from: lookUpBoxNodeByByPathOrNode(from, entry.from),
		to: lookUpBoxNodeByByPathOrNode(to, entry.to),
		interpolate: entry.interpolate || interpolateNodes
	}
});

export const preProcessLerpSpecWithIds = (from: FormulaNode, to: FormulaNode, lerpSpec: NodeInterpolationSpec[]) : NodeInterpolationSpec[] => {
	const lerpSpecsSeperated: { 
			byId: NodeInterpolationSpec[], 
			byPathOrNode: NodeInterpolationSpec[] 
		} = reduce(((sep, entry: NodeInterpolationSpec) => {
			const key = entry.id !== undefined ? "byId" : "byPathOrNode";
			return assocPath([key, sep[key].length], entry)(sep);
		}), { byId: [], byPathOrNode: [] })(lerpSpec);
	
	const idToLerpFuncMap: { [id: string]: NodeInterpolationFunc } = reduce((acc, val: NodeInterpolationSpec) => {
			return Object.assign(acc, { [val.id]: val.interpolate });
		}, {}, lerpSpecsSeperated.byId);

	const fromIdMap = collectIds(from);
	const toIdMap = collectIds(to);
	const ids = Reflect.ownKeys(fromIdMap) as string[];

	const processedIdSpecs : { from: PropertyPath, to: PropertyPath, interpolate: NodeInterpolationFunc }[] = [];
	for (const id of ids) {
		const fromPaths = fromIdMap[id];
		const toPaths = toIdMap[id];

		//this is a double-loop because it's easier than to write out all the cases
		//case 1: single -> single
		//case 2: single -> multiple (branching)
		//case 3: multiple -> single (merging)
		for (let i = 0; i < fromPaths.length; i++) {
			for (let j = 0; j < toPaths.length; j++) {
				processedIdSpecs.push({
					from: fromPaths[i],
					to: toPaths[j],
					interpolate: idToLerpFuncMap[id] || interpolateNodes
				});
			}
		}
	}

	return [
		...processedIdSpecs, 
		...lerpSpecsSeperated.byPathOrNode
	]
};

export const execInterpolation = (t: number) => ((lerpEntry: NodeInterpolationMap) : NodeInterpolation => lerpEntry.interpolate(lerpEntry.from, lerpEntry.to, t));
export const interpolateFormulas = (lerpMap: FormulaInterpolationMap) => ((t: number) : FormulaInterpolation => map(execInterpolation(t))(lerpMap));

//interpolation #####################

import rgba from 'color-rgba';
const interpolateCssColors = (a: string, b: string, t: number) : string => {
	const from = rgba(a);
	const to = rgba(b);
	const lerped = [0, 1, 2, 3].map(ind => interpolate(from[ind], to[ind], t));
	return `rgba(${lerped.join(",")})`;
};
const interpolateStyles = (a: Style, b: Style, t: number) : Style => identity({
    ...a,
    fontSize: interpolate(a.fontSize, b.fontSize, t),
    color: interpolateCssColors(a.color, b.color, t)
});
const interpolateDimensions = (a: Dimensions, b: Dimensions, t: number) : Dimensions => {
    return fromPairs(["width", "yMin", "yMax"].map(prop => [prop, interpolate(a[prop], b[prop], t)]));
};
export const interpolateNodes = (a: InterpolatableNode, b: InterpolatableNode, t: number) : NodeInterpolation => {
	return {
        ...a,
        style: interpolateStyles(a.style, b.style, t),
        position: lerpVectors(a.position, b.position, t),
        dimensions: interpolateDimensions(a.dimensions, b.dimensions, t)
    }
};


