import { concat } from "fp-ts/lib/Array";
import { BooleanSets, partitionIntoBooleanSets } from "../lib/boolean-sets";
import { hasId } from "../lib/with-id";
import { boxNodeOrd } from "./box-node-ord";
import { InterpolatableBoxNode } from "./interpolatable-box-node";
import { isIdLessTree } from "./lack-of-id";
import { flattenTopLevelNodes } from "./top-level-flat-node";

//we only need to bother assigning ids if we want to create a connection between two retained nodes
//for nodes that are either added or removed, ids are not necessary.
export function buildBooleanSets(before: InterpolatableBoxNode, after: InterpolatableBoxNode): BooleanSets<InterpolatableBoxNode> {
	const topLevelBefore = flattenTopLevelNodes(before);
	const topLevelAfter = flattenTopLevelNodes(after);
	const idNodesBefore = topLevelBefore.filter(hasId);
	const idNodesAfter = topLevelAfter.filter(hasId);
	const idLessNodesBefore = topLevelBefore.filter(isIdLessTree);
	const idLessNodesAfter = topLevelAfter.filter(isIdLessTree);
	const booleanSetById = partitionIntoBooleanSets(boxNodeOrd)(idNodesBefore, idNodesAfter);
	return {
		aOnly: concat(booleanSetById.aOnly)(idLessNodesBefore),
		bOnly: concat(booleanSetById.bOnly)(idLessNodesAfter),
		both: booleanSetById.both
	}
}