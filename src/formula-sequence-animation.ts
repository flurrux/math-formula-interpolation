import { animate } from "../lib/animation";
import { partitionIntoBooleanSets } from "../lib/boolean-sets";
import { normSine } from "../lib/easing";
import { waitMillis } from "../lib/wait-millis";
import { interpolateByBooleanSets } from "./boolean-set-interpolation";
import { buildBooleanSets } from "./boolean-sets";
import { boxNodeOrd } from "./box-node-ord";
import { renderFlatNodes } from "./box-node-rendering";
import { InterpolatableFormulaNode } from "./formula-construction";
import { FormulaSequence } from "./formula-sequence";
import { InterpolationContext } from "./interpolation-props";
import { prepareForInterpolation } from "./node-preparation";

export function createInterpolator(src: InterpolatableFormulaNode, target: InterpolatableFormulaNode){
	const layout1 = prepareForInterpolation(src);
	const layout2 = prepareForInterpolation(target);
	const boolSets = buildBooleanSets(layout1, layout2);
	const context: InterpolationContext = {
		srcNode: layout1,
		targetNode: layout2
	};

	return (t: number) => {
		return interpolateByBooleanSets(context)(t)(boolSets);
	};
}

export function renderStart(ctx: CanvasRenderingContext2D, sequence: FormulaSequence){
	if (sequence.length === 0) return;
	const interpolator = createInterpolator(...sequence[0]);
	const nodes = interpolator(0);
	renderFlatNodes(ctx)(nodes);
}

export async function animateFormulaSequence(ctx: CanvasRenderingContext2D, sequence: FormulaSequence) {
	for (const pair of sequence) {
		const interpolator = createInterpolator(...pair);

		const anim = animate(
			2000,
			(t) => {
				t = normSine(t);
				const nodes = interpolator(t);
				renderFlatNodes(ctx)(nodes);
			}
		);
		await anim.onFinished;
		await waitMillis(1000);
	}
}