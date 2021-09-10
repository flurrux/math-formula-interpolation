import { BoxAccentNode } from "@flurrux/math-layout-engine/src/layout/accent-layout";
import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { BoxDelimitedNode } from "@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout";
import { BoxFractionNode } from "@flurrux/math-layout-engine/src/layout/fraction-layout";
import { BoxMathListNode } from "@flurrux/math-layout-engine/src/layout/mathlist-layout";
import { BoxMatrixNode } from "@flurrux/math-layout-engine/src/layout/matrix-layout";
import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { renderNode } from "@flurrux/math-layout-engine/src/rendering/render";
import { BoxNode, BoxNodeType } from "@flurrux/math-layout-engine/src/types";
import { isAccented, isCharNode, isDelimited, isFraction, isMathList, isMatrix, isRoot, isScript, isTextNode, isTextualNode } from "../../lib/type-guards";
import { renderBoxNode } from "../../src/box-node-rendering";
import { EditableFormulaNode } from "./editable-node-types";

const renderEditableNodeRec = (ctx: CanvasRenderingContext2D) => (node: EditableFormulaNode) => {
	
	if (isCharNode(node)){
		return { ...node, type: "char" };
	}
	if (isTextNode(node)){
		return { ...node, type: "text" };
	}

	if (isMathList(node) || isMatrix(node)){
		return {
			...node,
			items: node.items.map(editableToBoxNode)
		} as (BoxMathListNode | BoxMatrixNode)
	}
	if (isFraction(node)){
		return {
			...node,
			numerator: editableToBoxNode(node.numerator),
			denominator: editableToBoxNode(node.denominator),
			rule: node.rule
		} as BoxFractionNode;
	}
	if (isScript(node)){
		let boxScriptNode: BoxScriptNode = { ...node };
		boxScriptNode.nucleus = editableToBoxNode(node.nucleus);
		if (node.sup) boxScriptNode.sup = editableToBoxNode(node.sup);
		if (node.sub) boxScriptNode.sub = editableToBoxNode(node.sub);
		return boxScriptNode;
	}
	if (isAccented(node)){
		return {
			...node,
			nucleus: editableToBoxNode(node.nucleus),
			accent: editableToBoxNode(node.accent) as BoxCharNode
		} as BoxAccentNode;
	}
	if (isRoot(node)){
		let boxRootNode: BoxRootNode = {
			...node,
			radicand: editableToBoxNode(node.radicand),
			radical: node.radical
		};
		if (node.index){
			boxRootNode.index = editableToBoxNode(node.index);
		}
		return boxRootNode;
	}
	if (isDelimited(node)){
		return {
			...node,
			delimited: editableToBoxNode(node.delimited)
		} as BoxDelimitedNode;
	}
	return node;
}

export const renderEditableNode = (ctx: CanvasRenderingContext2D, node: EditableFormulaNode) => {
	ctx.save();
	
	const { canvas } = ctx;
	const [w, h] = [canvas.width, canvas.height];
	ctx.fillStyle = "#dedede";
	ctx.fillRect(0, 0, w, h);
	
	ctx.setTransform(1, 0, 0, -1, w / 2, h / 2);
	
	renderEditableNodeRec(ctx)(node);
	
	ctx.restore();
};