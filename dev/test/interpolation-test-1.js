


import { layoutFormula, loadKatexFontFaces } from '@flurrux/math-layout-engine';
import { setPosition } from '@flurrux/math-layout-engine/src/layout/layout-util';
import { renderNode } from '@flurrux/math-layout-engine/src/rendering/render';
import { assocPath, map, pipe } from 'ramda';
import { globalizePositions, movePosition, alignSubNodeToGlobalPosition } from '../../lib/math-layout-util';
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
			{ type: "ord", value: "a", id: "a", branchId: "a1" },
			{ type: "bin", value: "*", id: "mul1", branchId: "mul11" },
			{ type: "ord", value: "b", id: "b" },
			{ type: "bin", value: "+", id: "plus" },
			{ type: "ord", value: "a", id: "a", branchId: "a2" },
			{ type: "bin", value: "*", id: "mul1", branchId: "mul12" },
			{ type: "ord", value: "c", id: "c" }
		]
	};
	const boxFormula2 = processFormula(formula2);

	const items1 = boxFormula1.items;
	const items2 = boxFormula2.items;
	const nodeCorrespondence = map(normalizePathOrNodeSpecEntry(boxFormula1, boxFormula2))(preProcessLerpSpecWithIds(formula1, formula2, [
		{
			from: "a", to: "a2",
			interpolate: (a, b, t) => {
				return movePosition([
					0, upDownSin(normalizeClamped(0.2, 0.95, t)) * 40
				])(interpolateNodes(a, b, t));
			}
		},
		{
			from: "mul1", to: "mul12",
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

	const formulas = [
		//a/b + c/d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { type: "ord", value: "a", id: "a" },
					denominator: { type: "ord", value: "b", id: "b" },
				},
				{ type: "bin", value: "+", id: "plus1" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "c", id: "c" },
					denominator: { type: "ord", value: "d", id: "d" },
				}
			]
		},

		//a/b + b/b * c/d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { type: "ord", value: "a", id: "a" },
					denominator: { type: "ord", value: "b", id: "b" },
				},
				{ type: "bin", value: "+", id: "plus1" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "b", id: "b", branchId: "numB" },
					denominator: { type: "ord", value: "b", id: "b", branchId: "denomB" },
				},
				{ type: "bin", value: "*" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "c", id: "c" },
					denominator: { type: "ord", value: "d", id: "d" },
				}
			]
		},

		// {
		// 	type: "mathlist", style,
		// 	items: [
		// 		{
		// 			type: "fraction",
		// 			numerator: {
		// 				type: "mathlist",
		// 				items: [
		// 					{ type: "ord", value: "a" },
		// 					{ type: "bin", value: "*" },
		// 					{ type: "ord", value: "d" }
		// 				]
		// 			},
		// 			denominator: {
		// 				type: "mathlist",
		// 				items: [
		// 					{ type: "ord", value: "b" },
		// 					{ type: "bin", value: "*" },
		// 					{ type: "ord", value: "d" }
		// 				]
		// 			}
		// 		},
		// 		{ type: "bin", value: "+" },
		// 		{
		// 			type: "fraction",
		// 			numerator: {
		// 				type: "mathlist",
		// 				items: [
		// 					{ type: "ord", value: "b" },
		// 					{ type: "bin", value: "*" },
		// 					{ type: "ord", value: "c" }
		// 				]
		// 			},
		// 			denominator: {
		// 				type: "mathlist",
		// 				items: [
		// 					{ type: "ord", value: "b" },
		// 					{ type: "bin", value: "*" },
		// 					{ type: "ord", value: "d" }
		// 				]
		// 			}
		// 		}
		// 	]
		// },

		// {
		// 	type: "fraction", style,
		// 	numerator: {
		// 		type: "mathlist",
		// 		items: [
		// 			{ type: "ord", value: "a" },
		// 			{ type: "bin", value: "*" },
		// 			{ type: "ord", value: "d" },
		// 			{ type: "bin", value: "+" },
		// 			{ type: "ord", value: "b" },
		// 			{ type: "bin", value: "*" },
		// 			{ type: "ord", value: "c" },
		// 		]
		// 	},
		// 	denominator: {
		// 		type: "mathlist",
		// 		items: [
		// 			{ type: "ord", value: "b" },
		// 			{ type: "bin", value: "*" },
		// 			{ type: "ord", value: "d" }
		// 		]
		// 	}
		// }
	];
	const formulasLayouted = [
		pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))(formulas[0]),
		pipe(preProcess, alignSubNodeToGlobalPosition(canvasCenter, ["items", 1]))(formulas[1]),
	];

	const corrSpec = preProcessLerpSpecWithIds(formulas[0], formulas[1], [
		{ from: ["items", 0, "rule"], to: ["items", 0, "rule"] },
		{ from: ["items", 2, "rule"], to: ["items", 4, "rule"] },
		{ 
			from: pipe(
				setColor("transparent"), 
				setPosition(formulasLayouted[0].items[0].denominator.position)
			)(formulasLayouted[1].items[2].rule), 
			to: setColor(style.color)(formulasLayouted[1].items[2].rule)
		},
	]);
	console.log(corrSpec);
	const lerpMap = map(normalizePathOrNodeSpecEntry(formulasLayouted[0], formulasLayouted[1]), corrSpec);
	return interpolateFormulas(lerpMap);
};

const main = () => {
    
	const lerp = test2();
    let t = 0;

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		Object.assign(ctx, { strokeStyle: style.color, fillStyle: style.color });
		ctx.setTransform(1, 0, 0, -1, 0, canvas.height);
		const nodes = lerp(t);
		nodes.forEach((node) => renderNode(ctx, node));
        ctx.restore();
    };
    render();

    document.body.insertAdjacentHTML("beforeend", `<input type="range" min="0" max="1" step="0.001" value="0" />`);
    document.querySelector("input").addEventListener("input", e => {
        t = parseFloat(e.srcElement.value);
        render();
	});
	
	// document.addEventListener("keydown", e => {
	// 	if (e.keyCode === 32){
	// 		playAnimation(2000, time => {
	// 			t = normSine(time);
	// 			render();
	// 		});
	// 	}
	// })

};
loadKatexFontFaces().then(main);