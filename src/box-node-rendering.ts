import { renderNode } from "@flurrux/math-layout-engine/src/rendering/render";
import { BoxNode } from "@flurrux/math-layout-engine/src/types";

function getNodeAlpha(node: BoxNode): number {
	if (!("alpha" in node)) return 1;
	return node.alpha;
}

const renderBoxNode = (ctx: CanvasRenderingContext2D) => (boxNode: BoxNode) => {
	ctx.save();
	//apply a slight rotation so that texts aren't snapped to pixels vertically
	ctx.rotate(0.001);
	let alpha = getNodeAlpha(boxNode);
	ctx.globalAlpha = alpha;
	renderNode(ctx, boxNode);
	ctx.restore();
};

export const renderFlatNodes = (ctx: CanvasRenderingContext2D) => (boxNodes: BoxNode[]) => {
	ctx.save();
	const { canvas } = ctx;
	const [w, h] = [canvas.width, canvas.height];
	ctx.fillStyle = "#dedede";
	ctx.fillRect(0, 0, w, h);
	ctx.setTransform(1, 0, 0, -1, w / 2, h / 2);
	boxNodes.forEach(renderBoxNode(ctx));
	ctx.restore();
};