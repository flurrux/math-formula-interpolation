import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { loadKatexFontFaces } from "@flurrux/math-layout-engine/src/rendering/render";
import { Style, withStyle } from "@flurrux/math-layout-engine/src/style";
import { BoxNode, ContoursNode, MatrixStyle } from "@flurrux/math-layout-engine/src/types";
import { intersperse } from "fp-ts/lib/Array";
import { range } from "fp-ts/lib/NonEmptyArray";
import { bezierPoint } from "../../lib/bezier-util";
import { Vector2, subtract, add, interpolate } from "../../lib/vector2";
import { fadeInNodeDefault, fadeOutNode, fadeOutNodeDefault, fadeNode} from "../../src/box-node-fading";
import { interpolateNodeDefault } from "../../src/box-node-interpolation";
import { renderFlatNodes } from "../../src/box-node-rendering";
import { char, delimit, fraction, mathList, matrix, root, script } from "../../src/formula-construction";
import { FormulaSequence } from "../../src/formula-sequence";
import { animateFormulaSequence, renderStart } from "../../src/formula-sequence-animation";
import { FadeFunc, InterpolationFunc, InterpolationProps } from "../../src/interpolation-props";
import { prepareForInterpolation } from "../../src/node-preparation";



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

const bezierLerpProps = <B extends BoxNode>(relCtrlPoints: Vector2[]): InterpolationProps<B> => ({
	interpolate: createBezierPathInterpolation(relCtrlPoints)
});

const defaultStyle: Style = {
	fontSize: 45,
	color: "black",
	preventTextPixelSnapping: false,
	type: "D"
};



//sequences ###

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
		// [formula1, formula2],
		// [formula3, formula4],
		[formula5, formula6],
	];
}

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

//s_1 + s_2 + s_3 -> \\sum_j s_j
function createSequence4(): FormulaSequence {
	function makeIndexedTerm(j: number){
		return script(
			char("s", "s"),
			undefined,
			char(j.toString())
		)
	}
	const f1 = mathList([
		makeIndexedTerm(1),
		char("+"),
		makeIndexedTerm(2),
		char("+"),
		makeIndexedTerm(3),
		char("+"),
		char("…")
	]);
	const f2 = mathList([
		script(
			{
				type: "op",
				value: "∑"
			},
			undefined,
			char("j")
		),
		script(
			char("s", "s"),
			undefined,
			char("j")
		)
	]);

	return [
		[f1, f2],
	];
}

//x * x * x -> x^3
function createSequence5(): FormulaSequence {
	const l = char("λ", "nuc-1");
	const mul = char("*");
	
	//λ * λ * λ
	const src = withStyle(defaultStyle)(
		mathList([
			l, mul, l, mul, l,
		])
	);

	//λ^3
	const target = withStyle(defaultStyle)(
		script(
			l,
			char("3"),
			undefined
		)
	);

	return [
		[src, target],
	];
}

//(a + b) * (a - b) -> a^2 - b^2
function createSequence6(): FormulaSequence {
	const f1 = mathList([
		delimit(
			char("("),
			mathList([
				char("a", "a"),
				char("+"),
				char("b", "b")
			]),
			char(")"),
		),
		char("*"),
		delimit(
			char("("),
			mathList([
				char("a", "a"),
				char("-", "-"),
				char("b", "b")
			]),
			char(")"),
		),
	]);
	const f2 = mathList([
		script(
			char("a", "a"),
			char("2"),
			undefined
		),
		char("-", "-"),
		script(
			char("b", "b"),
			char("2"),
			undefined
		)
	]);

	return [
		[f1, f2],
	];
}

//x^{-p} -> 1 / x^p
function createSequence7(): FormulaSequence {
	const f1 = script(
		char("x", "x"),
		mathList([char("-"), char("p", "p")]),
		undefined
	);
	const f2 = fraction(
		char("1", "1"),
		script(
			char("x", "x"),
			char("p", "p"),
			undefined
		)
	);

	return [
		[f1, f2],
	];
}

//matrix and vector multiplication
function createSequence8(): FormulaSequence {
	const defaultMatrixStyle: MatrixStyle = {
		type: "D",
		horizontalAlignment: "center",
		colSpacing: 0.6, 
		rowSpacing: 0.6
	};
	const makeMatrixEntry = (i: number, j: number) => script(
		char("M"),
		undefined,
		mathList([
			char(i.toString()),
			char(j.toString())
		]),
		`M_${i}${j}`
	);

	const f1 = mathList([
		delimit(
			char("[", "["),
			matrix(
				[
					makeMatrixEntry(1, 1), makeMatrixEntry(1, 2),
					makeMatrixEntry(2, 1), makeMatrixEntry(2, 2),
				],
				2, 2, defaultMatrixStyle,
			),
			char("]", "]")
		),
		char("*"),
		delimit(
			char("["),
			matrix(
				[
					char("u", "u"), char("v", "v"),
				],
				1, 2, 
				{
					...defaultMatrixStyle,
					colSpacing: 0.2,
					rowSpacing: 0.2
				}
			),
			char("]")
		)
	]);
	const f2 = delimit(
		char("[", "["),
		matrix(
			[
				mathList([
					makeMatrixEntry(1, 1),
					char("*"),
					char("u", "u"),
					char("+"),
					makeMatrixEntry(2, 1),
					char("*"),
					char("v", "v"),
				]),

				mathList([
					makeMatrixEntry(1, 2),
					char("*"),
					char("u", "u"),
					char("+"),
					makeMatrixEntry(2, 2),
					char("*"),
					char("v", "v"),
				])
			],
			2, 1,
			defaultMatrixStyle,
		),
		char("]", "]")
	);

	return [
		[f1, f2],
	];
}

//demonstration of a square root that is not growing dynamically
function createSequence9(): FormulaSequence {
	const f1 = mathList([
		root(
			char("x", "x"),
			undefined,
			undefined, undefined,
			{ id: "rad" }
		),
		char("*", "*"),
		root(char("y", "y")),
	]);
	const f2 = root(
		mathList([
			char("x", "x"),
			char("*", "*"),
			char("y", "y"),
		]),
		undefined,
		undefined, undefined,
		{ id: "rad" }
	);

	return [
		[f2, f1],
	];
}

//l(x) = r(x) -> l(x) - r(x) = 0 -> sum_j l_j * x^j - sum_j l_j * x^j = 0 -> sum_j (l_j - r_j) * x^j = 0
function createSequence10(): FormulaSequence {
	const fadeInMinus: FadeFunc<BoxCharNode> = (node, t, ctx) => {
		const srcPosition = subtract(ctx.srcNode.items[2].position, [30, 0]);
		const targetPosition = ctx.targetNode.items[1].position;
		const animPosition = interpolatePointByRelCtrlPoints([[0.5, -0.5]])(srcPosition, targetPosition, t);
		node = fadeInNodeDefault(t)(node);
		node = { ...node, position: animPosition };
		return node;
	};

	const f1 = mathList([
		mathList(
			["l", "(", "x", ")"].map(char), "l"
		),
		char(
			"=", "=", 
			{ interpolate: createBezierPathInterpolation([[0.5, -0.4]]) }
		),
		mathList(
			["r", "(", "x", ")"].map(char), "r", 
			{ interpolate: createBezierPathInterpolation([[0.5, -1.3]]) }
		),
	]);
	
	const f2 = mathList([
		mathList(["l", "(", "x", ")"].map(char), "l"),
		char(
			"-", undefined,
			{ fadeIn: fadeInMinus }
		),
		mathList(["r", "(", "x", ")"].map(char), "r"),
		char("=", "="),
		char("0"),
	]);

	const f3 = mathList([
		mathList([
			char("l", "l"),
			char("("),
			char("x", "l-x"),
			char(")"),
		]),
		char("-", "-"),
		mathList([
			char("r", "r"),
			char("("),
			char("x", "r-x"),
			char(")"),
		]),
		char("=", "="),
		char("0", "0"),
	]);

	const makePolynomialSum1 = (termSymbol: string) => {
		return mathList([
			script(
				{
					type: "op",
					value: "∑"
				},
				undefined,
				char("j")
			),
			script(
				char(termSymbol, termSymbol),
				undefined,
				char("j")
			),
			char("*"),
			script(
				char("x", `${termSymbol}-x`),
				char("j"),
				undefined,
			)
		]);
	};

	const f4 = mathList([
		makePolynomialSum1("l"),
		char("-", "-"),
		makePolynomialSum1("r"),
		char("=", "="),
		char("0", "0"),
	]);

	const makePolynomialSum2 = (termSymbol: string, sumCtrlPoints: Vector2[], xCtrlPoints: Vector2[], mulCtrlPoints: Vector2[]) => {
		return mathList([
			script(
				{
					type: "op",
					value: "∑"
				},
				undefined,
				char("j"),
				"∑",
				{ interpolate: createBezierPathInterpolation(sumCtrlPoints) }
			),
			script(
				char(termSymbol),
				undefined,
				char("j"),
				termSymbol
			),
			char("*", "*", { interpolate: createBezierPathInterpolation(mulCtrlPoints) }),
			script(
				char("x"),
				char("j"),
				undefined,
				"x",
				{ interpolate: createBezierPathInterpolation(xCtrlPoints) }
			)
		]);
	};

	const f5 = mathList([
		makePolynomialSum2("l", [], [[0.5, 0.6]], [[0.5, 0.6]]),
		char("-", "-"),
		makePolynomialSum2("r", [[0.5, 0.8]], [], []),
		char("=", "="),
		char("0", "0"),
	]);

	const fadeInHorizontally = <B extends BoxNode>(offset: number): FadeFunc<B> => {
		return (node, t) => {
			return fadeNode([[offset, 0], [0, 0]], [0, 1])(t)(node);
		}
	};

	const f6 = mathList([
		script(
			{
				type: "op",
				value: "∑"
			},
			undefined,
			char("j"),
			"∑"
		),
		char("(", undefined, { fadeIn: fadeInHorizontally(-60) }),
		script(
			char("l"),
			undefined,
			char("j"),
			"l"
		),
		char("-", "-"),
		script(
			char("r"),
			undefined,
			char("j"),
			"r"
		),
		char(")", undefined, { fadeIn: fadeInHorizontally(+60) }),

		char("*", "*"),
		script(
			char("x"),
			char("j"),
			undefined,
			"x"
		),

		char("=", "="),
		char("0", "0"),
	]);

	return [
		[f1, f2],
		[f3, f4],
		[f5, f6],
	];
}

function createSequence11(): FormulaSequence {
	const f1 = mathList([
		char("8", "8"),
		char("*", "*"),
		script(
			char("x"),
			char("2"),
			undefined,
			"x^2"
		),
		char("-"),
		char("5", "5", bezierLerpProps([[0.5, 1]])),
		char("=", "="),
		char("0")
	]);
	const f2 = mathList([
		char("8", "8"),
		char("*", "*"),
		script(
			char("x"),
			char("2"),
			undefined,
			"x^2"
		),
		char("=", "="),
		char("5", "5")
	]);

	
	const f3 = mathList([
		char("8", "8", bezierLerpProps([[0.5, -0.7]])),
		char("*", "*"),
		script(
			char("x"),
			char("2"),
			undefined,
			"x^2"
		),
		char("=", "="),
		char("5", "5")
	]);

	const f4 = mathList([
		script(
			char("x"),
			char("2"),
			undefined,
			"x^2"
		),
		char("=", "="),
		fraction(
			char("5", "5"),
			char("8", "8"),
		)
	]);

	const f5 = mathList([
		script(
			char("x", "x"),
			char("2"),
			undefined,
		),
		char("=", "="),
		fraction(
			char("5"),
			char("8"),
			"frac"
		)
	]);

	const f6 = mathList([
		char("x", "x"),
		char("=", "="),
		{
			type: "ord",
			value: "±"
		},
		root(
			fraction(
				char("5"),
				char("8"),
				"frac"
			)
		)
	]);

	return [
		[f1, f2],
		[f3, f4],
		[f5, f6]
	];
}


const formulaSequence = createSequence11();



document.body.insertAdjacentHTML("beforeend", "<canvas></canvas>");
const canvas = document.body.querySelector("canvas");
Object.assign(canvas, {
	width: window.innerWidth,
	height: window.innerHeight
});
const ctx = canvas.getContext("2d");



loadKatexFontFaces().then(
	() => renderStart(ctx, formulaSequence)
);

document.addEventListener("keydown", e => {
	if (e.key === " "){
		animateFormulaSequence(ctx, formulaSequence);
	}
});
