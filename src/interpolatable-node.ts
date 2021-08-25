import { BoxNode } from "@flurrux/math-layout-engine/src/types";
import { InterpolationProps } from "./interpolation-props";

export type InterpolatableBoxNode = BoxNode & InterpolationProps<BoxNode>;