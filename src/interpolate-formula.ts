
import { Style } from '@flurrux/math-layout-engine/src/style';
import { FormulaNode, BoxNode, Dimensions } from '@flurrux/math-layout-engine/src/types';
import { fromPairs, identity, map, reduce, assoc, assocPath, merge, omit } from 'ramda';
import { interpolate, viewPath } from '../lib/util';
import { interpolate as lerpVectors } from '../lib/vector2';
import { collectIds, IdPathMap } from '../lib/id-correspondence';
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

type NodeIdSpec = string | PropertyPath | BoxNode;
//todo: find a way to make this interface either have from and to, or id.
export interface NodeInterpolationSpec {
	from?: NodeIdSpec, to?: NodeIdSpec,
	id?: string,
	interpolate: NodeInterpolationFunc
};

const lookUpBoxNodeByByPathOrNode = (root: BoxNode, idSpec: NodeIdSpec) : BoxNode => {
	return Array.isArray(idSpec) ? (viewPath(idSpec as PropertyPath)(root) as BoxNode) : (idSpec as BoxNode);
};
export const normalizePathOrNodeSpecEntry = (from: BoxNode, to: BoxNode) => ((entry: NodeInterpolationSpec): NodeInterpolationMap => {
	return {
		from: lookUpBoxNodeByByPathOrNode(from, entry.from),
		to: lookUpBoxNodeByByPathOrNode(to, entry.to),
		interpolate: entry.interpolate || interpolateNodes
	}
});

const spreadIdAsFromTo = (entry: NodeInterpolationSpec) : NodeInterpolationSpec => {
	if (entry.id === undefined) return entry;
	return omit(["id"], merge(entry, { from: entry.id, to: entry.id }));
};
const createCorrespondenceFromIds = (from: FormulaNode, to: FormulaNode) => {
	const correspondences: {
			sharedId: string, fromUniqueId: string, toUniqueId: string,
			fromPath: PropertyPath, toPath: PropertyPath,
		}[] = [];

	const fromIdMap = collectIds(from);
	const toIdMap = collectIds(to);	
	const ids = Reflect.ownKeys(fromIdMap) as string[];	
	for (const id of ids) {
		const fromPaths = fromIdMap[id];
		const toPaths = toIdMap[id];

		//this is a double-loop because it's easier than to write out all the cases
		//case 1: single -> single
		//case 2: single -> multiple (branching)
		//case 3: multiple -> single (merging)
		for (let i = 0; i < fromPaths.length; i++) {
			const fromEntry = fromPaths[i];
			for (let j = 0; j < toPaths.length; j++) {
				const toEntry = toPaths[j];
				correspondences.push({
					fromUniqueId: fromEntry.uniqueId,
					toUniqueId: toEntry.uniqueId,
					sharedId: id,
					fromPath: fromEntry.path,
					toPath: toEntry.path
				});
			}
		}
	}
	return correspondences;
};

type CorrespondenceSpecType = ("id" | "path" | "node");
const getTypeOfCorrespondenceSpec = (spec: NodeIdSpec) : CorrespondenceSpecType => {
	if (Array.isArray(spec)) return "path";
	if (typeof(spec) === "string") return "id";
	return "node";
};
const validateCorrespondenceSpecTypes = (fromType: CorrespondenceSpecType, toType: CorrespondenceSpecType) => {
	if ((fromType === "id" && toType !== "id") || (toType === "id" && fromType !== "id")){
		throw `from: "${fromType}" and to: "${toType}" are not valid correspondence-types. either use id for both or path/node.`
	}
};
export const preProcessLerpSpecWithIds = (from: FormulaNode, to: FormulaNode, lerpSpec: NodeInterpolationSpec[]) : NodeInterpolationSpec[] => {
	//example: { id: "exp3" } => { from: "exp3", to: "exp3" }
	lerpSpec = map(spreadIdAsFromTo, lerpSpec);
	
	const lerpSpecsSeperated : { byId: NodeInterpolationSpec[], byPathOrNode: NodeInterpolationSpec[] } = reduce((acc, val) => {
		const fromType = getTypeOfCorrespondenceSpec(val.from);
		const toType = getTypeOfCorrespondenceSpec(val.to);
		validateCorrespondenceSpecTypes(fromType, toType);
		const prop = fromType === "id" ? "byId" : "byPathOrNode";
		return assocPath([prop, acc[prop].length], val, acc);
	}, { byId: [], byPathOrNode: [] }, lerpSpec);

	const correspondencesById = createCorrespondenceFromIds(from, to);
	const lerpSpecsById : NodeInterpolationSpec[] = correspondencesById.map(corr => {
		const corrLerpSpec = lerpSpecsSeperated.byId.find((spec) => spec.from === corr.fromUniqueId && spec.to === corr.toUniqueId);
		const interpolateFunc = corrLerpSpec ? corrLerpSpec.interpolate : interpolateNodes;
		return {
			from: corr.fromPath,
			to: corr.toPath,
			interpolate: interpolateFunc
		}
	});

	return [
		...lerpSpecsById,
		...lerpSpecsSeperated.byPathOrNode
	];
};

export const execInterpolation = (t: number) => ((lerpEntry: NodeInterpolationMap): NodeInterpolation => {
	return lerpEntry.interpolate(lerpEntry.from, lerpEntry.to, t) as NodeInterpolation;
});
export const interpolateFormulas = (lerpMap: FormulaInterpolationMap) => {
	return ((t: number) : FormulaInterpolation => map(execInterpolation(t))(lerpMap));
};

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
	...((a.fontSize && b.fontSize) ? { fontSize: interpolate(a.fontSize, b.fontSize, t)} : {}),
	...((a.color && b.color) ? { color: interpolateCssColors(a.color, b.color, t) } : {})
});
const interpolateDimensions = (a: Dimensions, b: Dimensions, t: number) : Dimensions => {
    return (fromPairs(["width", "yMin", "yMax"].map(prop => [prop, interpolate(a[prop], b[prop], t)])) as unknown) as Dimensions;
};
export const interpolateNodes = (a: InterpolatableNode, b: InterpolatableNode, t: number) : NodeInterpolation => {
	return {
        ...a,
        ...(a.style ? { style: interpolateStyles(a.style, b.style, t) } : {}),
        position: lerpVectors(a.position, b.position, t),
        dimensions: interpolateDimensions(a.dimensions, b.dimensions, t)
    }
};


