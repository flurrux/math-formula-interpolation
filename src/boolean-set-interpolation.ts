import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { BooleanSets } from "../lib/boolean-sets";
import { interpolateByClusters } from "./cluster-interpolation";
import { InterpolationContext } from "./interpolation-props";
import { fadeInNode, fadeOutNode } from './box-node-fading';
import { InterpolatableBoxNode } from "./interpolatable-box-node";


export const interpolateByBooleanSets = (context: InterpolationContext) => (t: number) => (boolSets: BooleanSets<InterpolatableBoxNode>): BoxNode[] => {
	return [
		...boolSets.aOnly.map(fadeOutNode(context)(t)),
		...boolSets.bOnly.map(fadeInNode(context)(t)),
		...flatten(
			boolSets.both.map(
				([clusterA, clusterB]) => interpolateByClusters(t)(clusterA, clusterB)
			)
		)
	]
};