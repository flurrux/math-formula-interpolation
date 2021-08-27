import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { interpolateNode } from "./box-node-interpolation";
import { InterpolatableBoxNode } from "./interpolatable-box-node";

type Cluster = NonEmptyArray<InterpolatableBoxNode>;

export const interpolateByClusters = (t: number) => (clusterA: Cluster, clusterB: Cluster): BoxNode[] => {
	if (clusterA.length > 1) {
		return clusterA.map(
			(a) => interpolateNode("from")(a, clusterB[0], t)
		)
	}
	if (clusterB.length > 1) {
		return clusterB.map(
			(b) => interpolateNode("to")(clusterA[0], b, t)
		)
	}
	if (clusterA.length > 0 && clusterB.length > 0) {
		return [interpolateNode("from")(clusterA[0], clusterB[0], t)];
	}
	return [];
};