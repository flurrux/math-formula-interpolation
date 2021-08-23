import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { contramap } from "fp-ts/lib/Ord";
import { getId, WithId } from "../lib/with-id";
import { Ord as stringOrd } from "fp-ts/lib/string";

export const boxNodeOrd = contramap<string, WithId<BoxNode>>(getId)(stringOrd);