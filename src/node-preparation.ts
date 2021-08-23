import { layoutFormula } from "@flurrux/math-layout-engine";
import { LayoutResult } from "@flurrux/math-layout-engine/src/layout/layout";
import { FormulaNode } from "@flurrux/math-layout-engine/src/types";
import { pipe } from "fp-ts/lib/function";
import { flattenById } from "../lib/flatten-layout-tree";
import { transferIds } from "../lib/transfer-ids";
import { replacePositionsByGlobal } from "../lib/transform-baking";

const centerOnOrigin = <L extends LayoutResult>(layout: L): L => ({
	...layout,
	position: [
		-layout.width / 2,
		-layout.dimensions.yMax / 2
	]
});

export const prepareForInterpolation = (formulaNode: FormulaNode) => pipe(
	formulaNode,
	layoutFormula,
	centerOnOrigin,
	transferIds(formulaNode),
	replacePositionsByGlobal,
	flattenById
);