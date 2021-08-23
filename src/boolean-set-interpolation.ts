import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { flatten } from "fp-ts/lib/Array";
import { BooleanSets } from "../lib/boolean-sets";
import { fadeInNode, fadeOutNode } from "./box-node-fading";
import { interpolateByClusters } from "./cluster-interpolation";

export const interpolateByBooleanSets = (t: number) => (boolSets: BooleanSets<BoxNode>): BoxNode[] => {
	return [
		...boolSets.aOnly.map(fadeOutNode(t)),
		...boolSets.bOnly.map(fadeInNode(t)),
		...flatten(
			boolSets.both.map(
				([clusterA, clusterB]) => interpolateByClusters(t)(clusterA, clusterB)
			)
		)
	]
};