import { layoutFormula } from "@flurrux/math-layout-engine";
import { LayoutResult } from "@flurrux/math-layout-engine/src/layout/layout";
import { BoxNode, FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { pipe } from "fp-ts/lib/function";
import { transferIds } from "./transfer-ids";
import { replacePositionsByGlobal } from "../lib/transform-baking";
import { markIdLessTrees } from "./lack-of-id";

const centerOnOrigin = <L extends LayoutResult>(layout: L): L => ({
	...layout,
	position: [
		-layout.width / 2,
		-layout.dimensions.yMax / 2
	]
});

export const prepareForInterpolation = (formulaNode: FormulaNode): BoxNode => pipe(
	formulaNode,
	layoutFormula,
	centerOnOrigin,
	transferIds(formulaNode),
	markIdLessTrees,
	replacePositionsByGlobal,
);