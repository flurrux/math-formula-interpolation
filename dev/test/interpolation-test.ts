import { loadKatexFontFaces } from "@flurrux/math-layout-engine/src/rendering/render";
import { char, mathList, root } from "../../lib/formula-construction";
import { renderFlatNodes } from "../../src/box-node-rendering";
import { FormulaSequence } from "../../src/formula-sequence";
import { animateFormulaSequence } from "../../src/formula-sequence-animation";
import { prepareForInterpolation } from "../../src/node-preparation";

//specific ###

// const defaultStyle: Style = {
// 	fontSize: 20,
// 	color: "black",
// 	preventTextPixelSnapping: true,
// 	type: "D"
// };

//sequence 1 ####

const formula1 = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	root(
		mathList([
			char("-"),
			char("1")
		]),
		undefined, "radical(1)",
	)
]);

const formula2 = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	root(
		mathList([
			char("-"),
			char("1")
		]),
		undefined, "radical(1)"
	),
	char("*", "*(2)"),
	root(
		mathList([
			char("-"),
			char("1")
		]),
		undefined, "radical(2)"
	),
]);

const formula3 = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	root(
		mathList([
			char("-"),
			char("1")
		], "-1"),
		undefined, undefined, 
		"radical(1)"
	),
	char("*", "*(2)"),
	root(
		mathList([
			char("-"),
			char("1")
		], "-1"),
		undefined, undefined,
		"radical(2)"
	),
]);

const formula4 = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	mathList([
		char("-"),
		char("1")
	], "-1")
]);

const formula5 = mathList([
	char("m", "m"),
	char("*", "*(1)"),
	mathList([
		char("-", "-"),
		char("1", "1")
	])
]);

const formula6 = mathList([
	char("-", "-"),
	char("m", "m"),
]);

const formulaSequence: FormulaSequence = [
	[formula1, formula2],
	[formula3, formula4],
	[formula5, formula6],
];



//sequence 2 ####

// const f1 = script(
// 	delimit(
// 		char("(", "("),
// 		mathList([
// 			char("a", "a(1)"),
// 			char("+", "+(1)"),
// 			char("b", "b(1)"),
// 		]),
// 		char(")", ")"),
// 	),
// 	char("2", "sup(1)"),
// 	undefined
// );

// const f2 = mathList([
// 	script(
// 		char("a", "a(1)"),
// 		char("2", "sup(1)"),
// 		undefined,
// 	),
// 	char("+", "+(1)"),
// 	script(
// 		char("b", "b(1)"),
// 		char("2", "sup(1)"),
// 		undefined,
// 	),
// 	char("+", "+(2)"),
// 	char("2", "sup(1)"),
// 	char("*", "*(1)"),
// 	char("a", "a(1)"),
// 	char("*", "*(2)"),
// 	char("b", "b(1)"),
// ]);
// const formulaSequence: FormulaSequence = [
// 	[f1, f2], 
// 	[f2, f1]
// ];




document.body.insertAdjacentHTML("beforeend", "<canvas></canvas>");
const canvas = document.body.querySelector("canvas");
Object.assign(canvas, {
	width: window.innerWidth,
	height: window.innerHeight
});
const ctx = canvas.getContext("2d");



loadKatexFontFaces().then(
	() => renderFlatNodes(ctx)(
		prepareForInterpolation(
			formulaSequence[0][0]
		)
	)
);

document.addEventListener("keydown", e => {
	if (e.key === " "){
		animateFormulaSequence(ctx, formulaSequence);
	}
});