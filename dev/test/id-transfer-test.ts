import { layoutFormula } from "@flurrux/math-layout-engine";
import { char, fraction, mathList } from "../../lib/formula-construction";
import { transferIds } from "../../lib/transfer-ids";

const formulaNode = mathList([
	fraction(
		char("f", "f"),
		char("g", "g")
	),
	char("+", "plus-1"),
	char("b", "b1")
]);

let layoutNode = layoutFormula(formulaNode);
layoutNode = transferIds(formulaNode, layoutNode);

console.log(layoutNode);