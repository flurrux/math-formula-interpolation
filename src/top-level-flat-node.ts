import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { constant } from "fp-ts/lib/function";
import { or, Predicate } from "fp-ts/lib/Predicate";
import { hasId } from "../lib/with-id";
import { flattenLayoutTree } from "./flatten-layout-tree";
import { isIdLessTree } from "./lack-of-id";

export const isTopLevelFlatNode: Predicate<BoxNode> = or(hasId)(isIdLessTree);

export const flattenTopLevelNodes = flattenLayoutTree(isTopLevelFlatNode, constant(false));