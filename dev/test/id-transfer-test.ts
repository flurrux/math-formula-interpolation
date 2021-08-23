import { layoutFormula } from "@flurrux/math-layout-engine";
import { char, fraction, mathList } from "../../lib/formula-construction";
import { transferIds } from "../../lib/transfer-ids";
import { attachGlobalPositions } from "../../lib/transform-baking";

const formulaNode = mathList([
	char("b", "b1"),
	char("+", "plus-1"),
	fraction(
		char("f", "f"),
		char("g", "g")
	),
]);

let layoutNode = layoutFormula(formulaNode);
layoutNode = transferIds(formulaNode, layoutNode);
layoutNode = attachGlobalPositions(layoutNode);

console.log(layoutNode);