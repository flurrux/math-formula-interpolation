import { loadKatexFontFaces } from "@flurrux/math-layout-engine/src/rendering/render";
import { BoxNode, ContoursNode } from "@flurrux/math-layout-engine/src/types";
import { intersperse } from "fp-ts/lib/Array";
import { bezierPoint } from "../../lib/bezier-util";
import { Vector2, subtract, add, interpolate } from "../../lib/vector2";
import { fadeOutNode, fadeOutNodeDefault } from "../../src/box-node-fading";
import { interpolateNodeDefault } from "../../src/box-node-interpolation";
import { renderFlatNodes } from "../../src/box-node-rendering";
import { char, delimit, mathList, root, script } from "../../src/formula-construction";
import { FormulaSequence } from "../../src/formula-sequence";
import { animateFormulaSequence } from "../../src/formula-sequence-animation";
import { FadeFunc, InterpolationFunc } from "../../src/interpolation-props";
import { prepareForInterpolation } from "../../src/node-preparation";


// const defaultStyle: Style = {
// 	fontSize: 20,
// 	color: "black",
// 	preventTextPixelSnapping: true,
// 	type: "D"
// };


/*

function createSequence2(): FormulaSequence {
	const f1 = script(
		delimit(
			char("(", "("),
			mathList([
				char("a", "a(1)"),
				char("+", "+(1)"),
				char("b", "b(1)"),
			]),
			char(")", ")"),
		),
		char("2", "sup(1)"),
		undefined
	);

	const f2 = mathList([
		script(
			char("a", "a(1)"),
			char("2", "sup(1)"),
			undefined,
		),
		char("+", "+(1)"),
		script(
			char("b", "b(1)"),
			char("2", "sup(1)"),
			undefined,
		),
		char("+", "+(1)"),
		char("2", "sup(1)"),
		char("*", "*(1)"),
		char("a", "a(1)"),
		char("*", "*(2)"),
		char("b", "b(1)"),
	]);
	return [
		[f1, f2], 
		[f2, f1]
	];
}

function createSequence3(): FormulaSequence {
	const makeCoefficient = (sym: string, j: number) => (
		mathList([
			script(
				char(sym),
				undefined,
				char(j.toString()),
			),
			char("*"),
			script(
				char("x"),
				char(j.toString()),
				undefined,
			),
		], `${sym}(${j})`)
	);

	const f1 = mathList([
		makeCoefficient("l", 0),
		char("+", "+(0)"),
		makeCoefficient("l", 1),
		char("+", "+(1)"),
		makeCoefficient("l", 2),
		char("+", "+(2)"),
		makeCoefficient("l", 3),
		char("+", "+(3)"),
		char("…", "…(1)"),

		char("=", "="),

		makeCoefficient("r", 0),
		char("+", "+(0)"),
		makeCoefficient("r", 1),
		char("+", "+(1)"),
		makeCoefficient("r", 2),
		char("+", "+(2)"),
		makeCoefficient("r", 3),
		char("+", "+(3)"),
		char("…", "…(1)"),
	]);

	const f2 = mathList([
		mathList([
			makeCoefficient("l", 0),
			char("-", "-(0)"),
			makeCoefficient("r", 0),
		]),

		char("+", "+(0)"),

		mathList([
			makeCoefficient("l", 1),
			char("-", "-(1)"),
			makeCoefficient("r", 1),
		]),

		char("+", "+(1)"),

		mathList([
			makeCoefficient("l", 2),
			char("-", "-(2)"),
			makeCoefficient("r", 2),
		]),

		char("+", "+(2)"),

		mathList([
			makeCoefficient("l", 3),
			char("-", "-(3)"),
			makeCoefficient("r", 3),
		]),

		char("+", "+(3)"),

		char("…", "…(1)"),

		char("=", "="),

		char("0", "0"),
	]);


	function makeDiffTerm(j: number) {
		return mathList([
			mathList([
				script(
					char("l"),
					undefined,
					char(j.toString()),
					`l_${j}`
				),
				char("*", `*(${j})`),
				script(
					char("x"),
					char(j.toString()),
					undefined,
					`x^${j}`
				),
			]),

			char("-", `-(${j})`),

			mathList([
				script(
					char("r"),
					undefined,
					char(j.toString()),
					`r_${j}`
				),
				char("*", `*(${j})`),

				script(
					char("x"),
					char(j.toString()),
					undefined,
					`x^${j}`
				),
			]),
		])
	}

	const f3 = mathList([
		makeDiffTerm(0),
		char("+", "+(0)"),
		makeDiffTerm(1),
		char("+", "+(1)"),
		makeDiffTerm(2),
		char("+", "+(2)"),
		makeDiffTerm(3),
		char("+", "+(3)"),
		char("…", "…(1)"),

		char("=", "="),

		char("0", "0"),
	]);

	function makeDelimitedDiffTerm(j: number) {
		return mathList([
			delimit(
				char("(", "(0"),
				mathList([
					script(
						char("l"),
						undefined,
						char(j.toString()),
						`l_${j}`
					),
					char("-", `-(${j})`),
					script(
						char("r"),
						undefined,
						char(j.toString()),
						`r_${j}`
					)
				]),
				char(")", ")0"),
			),

			char("*", `*(${j})`),

			script(
				char("x"),
				char(j.toString()),
				undefined,
				`x^${j}`
			),
		])
	}

	const f4 = mathList([
		makeDelimitedDiffTerm(0),
		char("+", "+(0)"),
		makeDelimitedDiffTerm(1),
		char("+", "+(1)"),
		makeDelimitedDiffTerm(2),
		char("+", "+(2)"),
		makeDelimitedDiffTerm(3),
		char("+", "+(3)"),
		char("…", "…(1)"),

		char("=", "="),

		char("0", "0"),
	]);

	return [
		[f1, f2],
		[f3, f4]
	];
}

*/

const interpolatePointByRelCtrlPoints = (relCtrlPoints: Vector2[]) => (from: Vector2, to: Vector2, t: number): Vector2 => {
	const p1 = from;
	const p2 = to;
	const relPoint = bezierPoint([
		[0, 0], ...relCtrlPoints, [1, 0]
	], t);
	const r = subtract(p2, p1);
	const u = [-r[1], r[0]];
	return add(
		p1,
		[
			r[0] * relPoint[0] + u[0] * relPoint[1],
			r[1] * relPoint[0] + u[1] * relPoint[1],
		]
	);
};
const createBezierPathInterpolation = (relCtrlPoints: Vector2[]) => <B extends BoxNode>(from: B, to: B, t: number): B => {
	const globPoint = interpolatePointByRelCtrlPoints(relCtrlPoints)(from.position, to.position, t);
	let result = interpolateNodeDefault(from, to, t);
	result = { ...result, position: globPoint };
	return result;
};



function createSequence1(): FormulaSequence {
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
		char("*"),
		root(
			mathList([
				char("-"),
				char("1")
			]),
		),
	]);

	const fadeOutRadical: FadeFunc<ContoursNode> = (node, t, ctx) => {
		const targetPosition = subtract(
			ctx.targetNode.items[2].position,
			[20, 0]
		);
		const animPosition = interpolate(node.position, targetPosition, t);
		node = fadeOutNodeDefault(t)(node);
		node = { ...node, position: animPosition };
		return node;
	};

	const formula3 = mathList([
		char("m", "m"),
		char("*", "*(1)"),
		root(
			mathList([
				char("-"),
				char("1")
			], "-1"),
			undefined, undefined, undefined, 
			{ fadeOut: fadeOutRadical }
		),
		char("*", "*(2)"),
		root(
			mathList([
				char("-"),
				char("1")
			], "-1"),
			undefined, undefined, undefined,
			{ fadeOut: fadeOutRadical }
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
		char("*"),
		mathList([
			char(
				"-", "-", 
				{ interpolate: createBezierPathInterpolation([[0.5, -1.1]]) }
			),
			char(
				"1", undefined, 
				{
					fadeOut: (node, t, ctx) => {
						const targetPoint = subtract(
							ctx.targetNode.items[0].position,
							[20, 0]
						);
						const animPoint = interpolatePointByRelCtrlPoints([[0.5, -1.1]])(node.position, targetPoint, t);
						return {
							...fadeOutNodeDefault(t)(node),
							position: animPoint
						}
					}
				}
			)
		])
	]);

	const formula6 = mathList([
		char("-", "-"),
		char("m", "m"),
	]);

	return [
		[formula1, formula2],
		[formula3, formula4],
		[formula5, formula6],
	];
}

const formulaSequence = createSequence1();


document.body.insertAdjacentHTML("beforeend", "<canvas></canvas>");
const canvas = document.body.querySelector("canvas");
Object.assign(canvas, {
	width: window.innerWidth,
	height: window.innerHeight
});
const ctx = canvas.getContext("2d");



loadKatexFontFaces().then(
	() => renderFlatNodes(ctx)([
		prepareForInterpolation(
			formulaSequence[0][0]
		)
	])
);

document.addEventListener("keydown", e => {
	if (e.key === " "){
		animateFormulaSequence(ctx, formulaSequence);
	}
});
