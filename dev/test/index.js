


import { layoutFormula, loadKatexFontFaces } from '@flurrux/math-layout-engine';
import { setPosition } from '@flurrux/math-layout-engine/src/layout/layout-util';
import { renderNode } from '@flurrux/math-layout-engine/src/rendering/render';
import { assocPath, map, pipe, range, identity } from 'ramda';
import { 
	globalizePositions, movePosition, alignToMarkedSubNode, translateGlobalPositionedFormulaTree, setColor, lookUpPathById 
} from '../../lib/math-layout-util';
import { normalizeClamped, upDownSin, playAnimation, normSine, viewPath } from '../../lib/util';
import * as Vec2 from '../../lib/vector2';
import { 
	interpolateFormulas, normalizePathOrNodeSpecEntry, interpolateNodes, preProcessLerpSpecWithIds 
} from '../../src/interpolate-formula';



const lookUpNodeById = (id, formula, layouted) => viewPath(lookUpPathById(id, formula))(layouted);
const mergeRules = (toRule, startPoint, endPoint) => (fromRule => {
	return pipe(
		assocPath(["position"], Vec2.add(toRule.position, [toRule.dimensions.width * startPoint, 0])),
		assocPath(["dimensions", "width"], (endPoint - startPoint) * toRule.dimensions.width)
	)(fromRule);
});
const mergeRulesById = (fromIds, toId, startPoints, formula1, layouted1, formula2, layouted2) => {
	const fromRules = fromIds.map(id => viewPath(lookUpPathById(id, formula1))(layouted1));
	const toRule = viewPath(lookUpPathById(toId, formula2))(layouted2);
	const rulePoints = [...startPoints, 1];
	return fromRules.map((fromRule, index) => {
		return {
			from: fromRule,
			to: mergeRules(toRule, rulePoints[index], rulePoints[index + 1])(fromRule)
		}
	});
};

const fadeInFromPosition = (id, positionNodeId, formula1, layouted1, formula2, layouted2) => {
	const node = lookUpNodeById(id, formula2, layouted2);
	const positionNode = lookUpNodeById(positionNodeId, formula1, layouted1);
	return {
		from: pipe(
			setColor("transparent"),
			setPosition(positionNode.position)
		)(node),
		to: node
	}
};





const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const canvasCenter = [canvas.width / 2, canvas.height / 2];
const style = {
	type: "D",
	fontSize: 40,
	color: "white",
	preventTextPixelSnapping: true
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
	const preProcess = (formula) => pipe(
		layoutFormula, 
		setPosition([0, 0]), 
		globalizePositions, 
		alignToMarkedSubNode(formula),
		translateGlobalPositionedFormulaTree(canvasCenter)
	)(formula);
	
	const reTimeLerp = (startTime, endTime) => ((a, b, t) => interpolateNodes(a, b, normalizeClamped(startTime, endTime, t)));
	const normSined = func => ((a, b, t) => func(a, b, normSine(t)));
	const reTimeSined = (startTime, endTime) => ((a, b, t) => interpolateNodes(a, b, normSine(normalizeClamped(startTime, endTime, t))));
	const idToSmoothTimeOffsetLerp = (startTime, endTime) => (id => identity({ id, interpolate: reTimeSined(startTime, endTime) }));
	const plusAxisCenter = [0.5, 0.42857387756501464];

	const formulas = [
		//a/b + c/d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { type: "ord", value: "a", corrId: "a" },
					rule: { type: "rule", corrId: "rule1" },
					denominator: { type: "ord", value: "b", corrId: "b" },
				},
				{ type: "bin", value: "+", corrId: "plus1", globalOrigin: plusAxisCenter },
				{
					type: "fraction",
					numerator: { type: "ord", value: "c", corrId: "c" },
					rule: { type: "rule", corrId: "rule2" },
					denominator: { type: "ord", value: "d", corrId: "d" },
				}
			]
		},

		//a/b + b/b * c/d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { type: "ord", value: "a", corrId: "a" },
					rule: { type: "rule", corrId: "rule1" },
					denominator: { type: "ord", value: "b", corrId: "b" },
				},

				{ type: "bin", value: "+", corrId: "plus1", globalOrigin: plusAxisCenter },
				
				{
					type: "fraction",
					numerator: { type: "ord", value: "b", corrId: ["b", "numB"] },
					rule: {  type: "rule", corrId: "rule3" },
					denominator: { type: "ord", value: "b", corrId: ["b", "denomB"] },
				},
				{ type: "bin", value: "*", corrId: "mul1" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "c", corrId: "c" },
					rule: { type: "rule", corrId: "rule2" },
					denominator: { type: "ord", value: "d", corrId: "d" },
				}
			]
		},

		//a/b * d/d + b/b * c/d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { type: "ord", value: "a", corrId: "a" },
					rule: { type: "rule", corrId: "rule1" },
					denominator: { type: "ord", value: "b", corrId: "b" },
				},
				{ type: "bin", value: "*", corrId: "mul2" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "d", corrId: ["d", "numD"] },
					rule: {  type: "rule", corrId: "rule4" },
					denominator: { type: "ord", value: "d", corrId: ["d", "denomD"] },
				},

				{ type: "bin", value: "+", corrId: "plus1", globalOrigin: plusAxisCenter },

				{
					type: "fraction",
					numerator: { type: "ord", value: "b", corrId: "numB" },
					rule: {  type: "rule", corrId: "rule3" },
					denominator: { type: "ord", value: "b", corrId: "denomB" },
				},
				{ type: "bin", value: "*", corrId: "mul1" },
				{
					type: "fraction",
					numerator: { type: "ord", value: "c", corrId: "c" },
					rule: { type: "rule", corrId: "rule2" },
					denominator: { type: "ord", value: "d", corrId: "d" },
				}
			]
		},

		//a*d/b*d + b*c/b*d
		{
			type: "mathlist", style,
			items: [
				{
					type: "fraction",
					numerator: { 
						type: "mathlist",
						items: [
							{ type: "ord", value: "a", corrId: "a" },
							{ type: "bin", value: "*", corrId: "mul2" },
							{ type: "ord", value: "d", corrId: "numD" }
						]
					},
					rule: {  type: "rule", corrId: "rule5" },
					denominator: { 
						type: "mathlist",
						items: [
							{ type: "ord", value: "b", corrId: ["b", "finalB"] },
							{ type: "bin", value: "*", corrId: ["mul2", "finalMul"] },
							{ type: "ord", value: "d", corrId: ["denomD", "finalD"] }
						]
					}
				},
				
				{ type: "bin", value: "+", corrId: "plus1", globalOrigin: plusAxisCenter },

				{
					type: "fraction",
					numerator: { 
						type: "mathlist",
						items: [
							{ type: "ord", value: "b", corrId: "numB" },
							{ type: "bin", value: "*", corrId: "mul1" },
							{ type: "ord", value: "c", corrId: "c" }
						]
					},
					rule: {  type: "rule", corrId: "rule6" },
					denominator: { 
						type: "mathlist",
						items: [
							{ type: "ord", value: "b", corrId: ["denomB", "finalB"] },
							{ type: "bin", value: "*", corrId: ["mul1", "finalMul"] },
							{ type: "ord", value: "d", corrId: ["d", "finalD"] }
						]
					}
				}
			]
		},

		//(a*d + b*c) / b*d
		{
			type: "fraction", style,
			numerator: {
				type: "mathlist",
				items: [
					{ type: "ord", value: "a", corrId: "a" },
					{ type: "bin", value: "*", corrId: "mul2" },
					{ type: "ord", value: "d", corrId: "numD" },
					{ type: "bin", value: "+", corrId: "plus1" },
					{ type: "ord", value: "b", corrId: "numB" },
					{ type: "bin", value: "*", corrId: "mul1" },
					{ type: "ord", value: "c", corrId: "c" }
				]
			},
			rule: { type: "rule", corrId: "rule7", globalOrigin: [0.5, 0] },
			denominator: {
				type: "mathlist",
				items: [
					{ type: "ord", value: "b", corrId: "finalB" },
					{ type: "bin", value: "*", corrId: "finalMul" },
					{ type: "ord", value: "d", corrId: "finalD" }
				]
			}
		},
	];
	const formulasLayouted = map(preProcess, formulas); 

	const correspondences = [
		[
			...["c", "d", "rule2"].map(idToSmoothTimeOffsetLerp(0.5, 1)),
			fadeInFromPosition("rule3", "b", formulas[0], formulasLayouted[0], formulas[1], formulasLayouted[1]),
			fadeInFromPosition("mul1", "b", formulas[0], formulasLayouted[0], formulas[1], formulasLayouted[1]),
		],

		[
			...["a", "b", "rule1"].map(idToSmoothTimeOffsetLerp(0.5, 1)),
			fadeInFromPosition("rule4", "d", formulas[1], formulasLayouted[1], formulas[2], formulasLayouted[2]),
			fadeInFromPosition("mul2", "d", formulas[1], formulasLayouted[1], formulas[2], formulasLayouted[2]),
		],
		
		[
			...mergeRulesById(["rule1", "rule4"], "rule5", [0, 0.5], formulas[2], formulasLayouted[2], formulas[3], formulasLayouted[3]),
			...mergeRulesById(["rule3", "rule2"], "rule6", [0, 0.5], formulas[2], formulasLayouted[2], formulas[3], formulasLayouted[3]),
		],
		
		[
			...mergeRulesById(["rule5", "rule6"], "rule7", [0, 0.5], formulas[3], formulasLayouted[3], formulas[4], formulasLayouted[4])
		]
	];

	const lerpMaps = map(ind => {
		const corrSpec = preProcessLerpSpecWithIds(formulas[ind], formulas[ind + 1], correspondences[ind]);
		const lerpMap = map(normalizePathOrNodeSpecEntry(formulasLayouted[ind], formulasLayouted[ind + 1]), corrSpec);
		return interpolateFormulas(lerpMap);
	})(range(0, correspondences.length));

	const lerp = t => {
		const ind = Math.min(correspondences.length - 1, Math.floor(t));
		return lerpMaps[ind](t - ind);
	};

	return lerp;
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

    document.body.insertAdjacentHTML("beforeend", `<input type="range" min="0" max="4" step="0.001" value="0" />`);
    document.querySelector("input").addEventListener("input", e => {
        t = parseFloat(e.srcElement.value);
        render();
	});
	
	const slopeStepFunc = (plateauDuration, slopeDuration, stepCount) => {
		return t => {
			t *= stepCount * slopeDuration + (stepCount - 1) * plateauDuration;
			const slopeAndPlatIndex = Math.floor(t / (plateauDuration + slopeDuration));
			const relT = t - (plateauDuration + slopeDuration) * slopeAndPlatIndex;
			if (relT > slopeDuration){
				return slopeAndPlatIndex + 1;
			}
			return slopeAndPlatIndex + relT / slopeDuration;
		};
	};
	const customDurationsSlopeStepFunc = (durations) => {
		const durationSum = durations.reduce((acc, val) => acc + val, 0, durations);
		console.log(durationSum);
		return t => {
			t *= durationSum;
			let curDur = 0;
			for (let i = 0; i < durations.length; i++){
				const nextDur = curDur + durations[i];
				if (t <= nextDur){
					if (i % 2 === 1){
						return (i - 1) / 2 + 1;
					}
					return (i / 2) + (t - curDur) / durations[i];
				}
				curDur = nextDur;
			}
			return 0;
		};
	};

	document.addEventListener("keydown", e => {
		if (e.keyCode === 32){
			const timingFunc = customDurationsSlopeStepFunc([1000, 600, 1200, 600, 800, 600, 1000]);
			playAnimation(8000, time => {
				t = timingFunc(time);
				render();
			});
		}
	})

};
loadKatexFontFaces().then(main);