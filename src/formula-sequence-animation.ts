import { animate } from "../lib/animation";
import { partitionIntoBooleanSets } from "../lib/boolean-sets";
import { normSine } from "../lib/easing";
import { waitMillis } from "../lib/wait-millis";
import { interpolateByBooleanSets } from "./boolean-set-interpolation";
import { buildBooleanSets } from "./boolean-sets";
import { boxNodeOrd } from "./box-node-ord";
import { renderFlatNodes } from "./box-node-rendering";
import { FormulaSequence } from "./formula-sequence";
import { InterpolationContext } from "./interpolation-props";
import { prepareForInterpolation } from "./node-preparation";

export async function animateFormulaSequence(ctx: CanvasRenderingContext2D, sequence: FormulaSequence) {
	for (const pair of sequence) {
		const layout1 = prepareForInterpolation(pair[0]);
		const layout2 = prepareForInterpolation(pair[1]);
		const boolSets = buildBooleanSets(layout1, layout2);
		const context: InterpolationContext = {
			srcNode: layout1,
			targetNode: layout2
		};

		const anim = animate(
			2000,
			(t) => {
				t = normSine(t);
				const nodes = interpolateByBooleanSets(context)(t)(boolSets);
				renderFlatNodes(ctx)(nodes);
			}
		);
		await anim.onFinished;
		await waitMillis(1000);
	}
}