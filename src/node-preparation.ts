import { layoutFormula } from "@flurrux/math-layout-engine";
import { LayoutResult } from "@flurrux/math-layout-engine/src/layout/layout";
import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { pipe } from "fp-ts/lib/function";
import { transferAllInterpolationProps } from "./transfer-interpolation-props";
import { replacePositionsByGlobal } from "../lib/transform-baking";
import { markIdLessTrees } from "./lack-of-id";
import { InterpolatableFormulaNode } from "./formula-construction";
import { InterpolatableBoxNode } from "./interpolatable-box-node";

const centerOnOrigin = <L extends LayoutResult>(layout: L): L => ({
	...layout,
	position: [
		-layout.width / 2,
		-layout.dimensions.yMax / 2
	]
});

export const prepareForInterpolation = (formulaNode: InterpolatableFormulaNode) => pipe(
	formulaNode,
	layoutFormula,
	centerOnOrigin,
	transferAllInterpolationProps(formulaNode),
	markIdLessTrees,
	replacePositionsByGlobal,
) as InterpolatableBoxNode;