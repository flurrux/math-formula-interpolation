import { layoutFormula } from "@flurrux/math-layout-engine";
import { pipe } from "fp-ts/lib/function";
import { attachGlobalPositions } from "../../lib/transform-baking";
import { char, mathList, root } from "../../src/formula-construction";
import { markIdLessTrees } from "../../src/lack-of-id";
import { flattenTopLevelNodes } from "../../src/top-level-flat-node";
import { transferIds } from "../../src/transfer-ids";

const formulaNode = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	root(
		mathList([
			char("-"),
			char("1")
		]),
		undefined, "radical(1)"
	),
	char("*"),
	root(
		mathList([
			char("-"),
			char("1")
		]),
	),
]);

let layoutNode = pipe(
	formulaNode, 
	layoutFormula,
	transferIds(formulaNode),
	markIdLessTrees
);
// layoutNode = attachGlobalPositions(layoutNode);
// const flatLayout = flattenTopLevelNodes(layoutNode);

console.log(layoutNode);