import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { constant } from "fp-ts/lib/function";
import { or, Predicate } from "fp-ts/lib/Predicate";
import { hasId } from "../lib/with-id";
import { flattenLayoutTree } from "./flatten-layout-tree";
import { InterpolatableBoxNode } from "./interpolatable-box-node";
import { isIdLessTree } from "./lack-of-id";

export const isTopLevelFlatNode: Predicate<InterpolatableBoxNode> = or(hasId)(isIdLessTree);

export const flattenTopLevelNodes: ((root: InterpolatableBoxNode) => InterpolatableBoxNode[]) = flattenLayoutTree(isTopLevelFlatNode, constant(false));