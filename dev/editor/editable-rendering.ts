import { renderBoundingBox, renderChar, renderContours, renderNode, renderRule, renderText, renderTextNode } from "@flurrux/math-layout-engine/src/rendering/render";
import { Style } from "@flurrux/math-layout-engine/src/style";
import { isAccented, isCharNode, isDelimited, isFraction, isMathList, isMatrix, isRoot, isScript, isTextualNode } from "../../lib/type-guards";
import { EditableFormulaNode, LayoutAttachedProps } from "./editable-node-types";


const applyColorToCtx = (ctx: CanvasRenderingContext2D) => (style: Style) => {
	const { color } = style;
	if (!color) return;

	Object.assign(ctx, {
		strokeStyle: color,
		fillStyle: color
	});
};



type OptEditableFormulaNode = EditableFormulaNode | null | undefined;

const renderEditableNodesRec = (ctx: CanvasRenderingContext2D) => (nodes: OptEditableFormulaNode[]) => {
	for (const node of nodes){
		if (!node) continue;
		renderEditableNodeRec(ctx)(node);
	}
};

const renderEditableNodeRec = (ctx: CanvasRenderingContext2D) => (node: EditableFormulaNode) => {
	ctx.save();
	ctx.translate(...node.position);

	renderBoundingBox(ctx, node);
	applyColorToCtx(ctx)(node.renderStyle);

	if (isTextualNode(node)){
		const boxType = isCharNode(node) ? "char" : "text";
		const renderableNode = {
			...node,
			style: node.renderStyle,
			type: boxType
		};
		if (boxType === "char"){
			renderChar(ctx, renderableNode);
		}
		else if (boxType === "text"){
			renderTextNode(ctx, renderableNode);
		}
	}
	else if (isMathList(node) || isMatrix(node)){
		node.items.forEach(renderEditableNodeRec(ctx));
	}
	else if (isFraction(node)){
		renderEditableNodesRec(ctx)([node.numerator, node.denominator]);
		renderRule(ctx, node.rule);
	}
	else if (isScript(node)){
		renderEditableNodesRec(ctx)([node.nucleus, node.sup, node.sub]);
	}
	else if (isAccented(node)){
		renderEditableNodesRec(ctx)([node.nucleus, node.accent]);
	}
	else if (isRoot(node)){
		renderEditableNodesRec(ctx)([node.radicand, node.index]);
		renderContours(ctx, node.radical);
	}
	else if (isDelimited(node)){
		renderEditableNodeRec(ctx)(node.delimited);
		renderContours(ctx, node.leftDelim);
		renderContours(ctx, node.rightDelim);
	}
	ctx.restore();
}

export const renderEditableNode = (ctx: CanvasRenderingContext2D, node: EditableFormulaNode) => {
	ctx.save();
	
	const { canvas } = ctx;
	const [w, h] = [canvas.width, canvas.height];
	ctx.fillStyle = "#dedede";
	ctx.fillRect(0, 0, w, h);
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	
	ctx.setTransform(1, 0, 0, -1, w / 2, h / 2);
	
	renderEditableNodeRec(ctx)(node);
	
	ctx.restore();
};