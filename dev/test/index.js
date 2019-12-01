


import { layoutFormula, loadKatexFontFaces } from '@flurrux/math-layout-engine';
import { setPosition } from '@flurrux/math-layout-engine/src/layout/layout-util';
import { renderNode } from '@flurrux/math-layout-engine/src/rendering/render';
import { assocPath, map, pipe } from 'ramda';
import { globalizePositions, movePosition } from '../../lib/math-layout-util';
import { normalizeClamped, upDownSin, playAnimation, normSine } from '../../lib/util';
import * as Vec2 from '../../lib/vector2';
import { interpolateFormulas, normalizePathOrNodeSpecEntry, interpolateNodes, preProcessLerpSpecWithIds } from '../../src/interpolate-formula';

const setColor = (color) => assocPath(["style", "color"], color);

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const canvasCenter = [canvas.width / 2, canvas.height / 2];
const style = {
	type: "D",
	fontSize: 40,
	color: "white",
	preventPixelSnapping: true
};

const test1 = () => {
	const processFormula = pipe(layoutFormula, setPosition(canvasCenter), globalizePositions);

	//a*(b+c)
	const formula1 = {
		type: "mathlist", style,
		items: [
			{ type: "ord", value: "a", id: "a" },
			{ type: "bin", value: "*", id: "mul1" },
			{ type: "open", value: "(" },
			{ type: "ord", value: "b", id: "b" },
			{ type: "bin", value: "+", id: "plus" },
			{ type: "ord", value: "c", id: "c" },
			{ type: "close", value: ")" }
		]
	};
	const boxFormula1 = processFormula(formula1);

	//a*b + a*c
	const formula2 = {
		type: "mathlist", style,
		items: [
			{ type: "ord", value: "a", id: "a" },
			{ type: "bin", value: "*", id: "mul1" },
			{ type: "ord", value: "b", id: "b" },
			{ type: "bin", value: "+", id: "plus" },
			{ type: "ord", value: "a" },
			{ type: "bin", value: "*" },
			{ type: "ord", value: "c", id: "c" }
		]
	};
	const boxFormula2 = processFormula(formula2);

	const items1 = boxFormula1.items;
	const items2 = boxFormula2.items;
	const nodeCorrespondence = map(normalizePathOrNodeSpecEntry(boxFormula1, boxFormula2))(preProcessLerpSpecWithIds(formula1, formula2, [
		{
			from: items1[0], to: items2[4],
			interpolate: (a, b, t) => {
				return movePosition([
					0, upDownSin(normalizeClamped(0.2, 0.95, t)) * 40
				])(interpolateNodes(a, b, t));
			}
		},
		{
			from: items1[1], to: items2[5],
			interpolate: (a, b, t) => {
				return movePosition([
					0, upDownSin(normalizeClamped(0.1, 0.85, t)) * 40
				])(interpolateNodes(a, b, t));
			}
		},
		{
			from: items1[2], 
			to: pipe(
					setPosition(Vec2.add([-40, 0], canvasCenter)), 
					setColor("transparent")
				)(items1[2])
		},
		{
			from: items1[6], 
			to: pipe(
					setPosition(Vec2.add([200, 0], canvasCenter)),
					setColor("transparent")
				)(items1[6])
		}
	]));
	return interpolateFormulas(nodeCorrespondence);
};

const test2 = () => {
	const preProcess = pipe(layoutFormula, setPosition([0, 0]), globalizePositions);

	const node1 = pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))({
		type: "mathlist", style,
		items: [
			{
				type: "fraction",
				numerator: { type: "ord", value: "a" },
				denominator: { type: "ord", value: "b" },
			},
			{ type: "bin", value: "+" },
			{
				type: "fraction",
				numerator: { type: "ord", value: "c" },
				denominator: { type: "ord", value: "d" },
			}
		]
	});
	const node2 = pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))({
		type: "mathlist", style,
		items: [
			{
				type: "fraction",
				numerator: {
					type: "mathlist",
					items: [
						{ type: "ord", value: "a" },
						{ type: "bin", value: "*" },
						{ type: "ord", value: "d" }
					]
				},
				denominator: {
					type: "mathlist",
					items: [
						{ type: "ord", value: "b" },
						{ type: "bin", value: "*" },
						{ type: "ord", value: "d" }
					]
				}
			},
			{ type: "bin", value: "+" },
			{
				type: "fraction",
				numerator: {
					type: "mathlist",
					items: [
						{ type: "ord", value: "b" },
						{ type: "bin", value: "*" },
						{ type: "ord", value: "c" }
					]
				},
				denominator: {
					type: "mathlist",
					items: [
						{ type: "ord", value: "b" },
						{ type: "bin", value: "*" },
						{ type: "ord", value: "d" }
					]
				}
			}
		]
	});
	let node3 = pipe(preProcess)({
		type: "fraction", style,
		numerator: {
			type: "mathlist",
			items: [
				{ type: "ord", value: "a" },
				{ type: "bin", value: "*" },
				{ type: "ord", value: "d" },
				{ type: "bin", value: "+" },
				{ type: "ord", value: "b" },
				{ type: "bin", value: "*" },
				{ type: "ord", value: "c" },
			]
		},
		denominator: {
			type: "mathlist",
			items: [
				{ type: "ord", value: "b" },
				{ type: "bin", value: "*" },
				{ type: "ord", value: "d" }
			]
		}
	});
	node3 = translateGlobalPositionedFormulaTree(
		subtractVectors(
			canvasCenter, [
			view(lensPath(["numerator", "items", 3, "position", 0]))(node3),
			view(lensPath(["rule", "position", 1]))(node3)
		]
		)
	)(node3);

	const nodeCorrespondence1 = [
		{
			from: node1.items[0].numerator,
			to: node2.items[0].numerator.items[0]
		},
		{
			from: node1.items[0].denominator,
			to: node2.items[0].denominator.items[0]
		},
		{
			from: node1.items[0].rule,
			to: node2.items[0].rule
		},
		fadeIn(node2.items[0].denominator.items[1]),
		{
			from: node1.items[2].denominator,
			to: node2.items[0].denominator.items[2]
		},
		fadeIn(node2.items[0].numerator.items[1]),
		{
			from: node1.items[2].denominator,
			to: node2.items[0].numerator.items[2]
		},

		{ from: node1.items[1], to: node2.items[1] },

		{
			from: node1.items[2].numerator,
			to: node2.items[2].numerator.items[2]
		},
		{
			from: node1.items[2].denominator,
			to: node2.items[2].denominator.items[2]
		},
		{
			from: node1.items[2].rule,
			to: node2.items[2].rule
		},
		fadeIn(node2.items[2].denominator.items[1]),
		{
			from: node1.items[0].denominator,
			to: node2.items[2].denominator.items[0]
		},
		fadeIn(node2.items[2].numerator.items[1]),
		{
			from: node1.items[0].denominator,
			to: node2.items[2].numerator.items[0]
		},
	];
	const nodeCorrespondence2 = [
		...[0, 1, 2].map(ind => {
			return {
				from: node2.items[0].numerator.items[ind],
				to: node3.numerator.items[ind]
			}
		}),
		...[0, 1, 2].map(ind => {
			return {
				from: node2.items[2].numerator.items[ind],
				to: node3.numerator.items[4 + ind]
			}
		}),
		{
			from: node2.items[1],
			to: node3.numerator.items[3]
		},
		...[0, 1, 2].map(ind => {
			return {
				from: node2.items[0].denominator.items[ind],
				to: node3.denominator.items[ind]
			}
		}),
		...[0, 1, 2].map(ind => {
			return {
				from: node2.items[2].denominator.items[ind],
				to: node3.denominator.items[ind]
			}
		}),
		{
			from: node2.items[0].rule,
			to: node3.rule,
			interpolateWidth: (a, b, t) => interpolate(a, b / 2, t)
		},
		{
			from: node2.items[2].rule,
			to: node3.rule,
			interpolatePosition: (a, b, t) => [
				interpolate(a[0], b[0] + node3.rule.dimensions.width / 2, t),
				interpolate(a[1], b[1], t)
			],
			interpolateWidth: (a, b, t) => interpolate(a, b / 2, t)
		},
	];
};

const main = () => {
    
	const lerp = test1();
    let t = 0;

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
		const nodes = lerp(t);
		nodes.forEach((node) => renderNode(ctx, node));
        ctx.restore();
    };
    render();

    // document.body.insertAdjacentHTML("beforeend", `<input type="range" min="0" max="1" step="0.001" value="0" />`);
    // document.querySelector("input").addEventListener("input", e => {
    //     t = parseFloat(e.srcElement.value);
    //     render();
	// });
	
	document.addEventListener("keydown", e => {
		if (e.keyCode === 32){
			playAnimation(2000, time => {
				t = normSine(time);
				render();
			});
		}
	})

};
loadKatexFontFaces().then(main);