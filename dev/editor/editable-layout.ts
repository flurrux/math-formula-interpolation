import { BoxAccentNode } from "@flurrux/math-layout-engine/src/layout/accent-layout";
import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { BoxDelimitedNode } from "@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout";
import { BoxFractionNode } from "@flurrux/math-layout-engine/src/layout/fraction-layout";
import { layout } from "@flurrux/math-layout-engine/src/layout/layout";
import { BoxMatrixNode } from "@flurrux/math-layout-engine/src/layout/matrix-layout";
import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { BoxTextNode } from "@flurrux/math-layout-engine/src/layout/text-layout";
import { isNodeChar, isNodeTextual } from "@flurrux/math-layout-engine/src/node-types";
import { BoxNode, MathListNode, MatrixNode } from "@flurrux/math-layout-engine/src/types";
import { EditableAccentNode, EditableCharNode, EditableDelimitedNode, EditableFormulaNode, EditableFractionNode, EditableMathListNode, EditableMatrixNode, EditableRootNode, EditableScriptNode, EditableTextNode, LayoutAttachedProps } from "./editable-node-types";
import { isAccented, isDelimited, isFraction, isMathList, isMatrix, isRoot, isScript } from '../../lib/type-guards';
import { BoxMathListNode } from "@flurrux/math-layout-engine/src/layout/mathlist-layout";
import { zipWith } from "fp-ts/lib/Array";


type EditableNodeAndBoxNodePair = [EditableCharNode, BoxCharNode] | [EditableTextNode, BoxTextNode] | [EditableMathListNode, MathListNode] | [EditableFractionNode, BoxFractionNode] | [EditableScriptNode, BoxScriptNode] | [EditableAccentNode, BoxAccentNode] | [EditableMatrixNode, BoxMatrixNode] | [EditableRootNode, BoxRootNode] | [EditableDelimitedNode, BoxDelimitedNode];


function getLayoutAttachedProps(node: BoxNode): LayoutAttachedProps {
	return {
		position: node.position,
		dimensions: node.dimensions
	}
}

const assignLayoutAttachedProps = (boxNode: BoxNode) => <N extends object>(node: N): (N & LayoutAttachedProps) => ({
	...node,
	...getLayoutAttachedProps(boxNode)
});

const combineBoxNodeAndEditableNode = <N extends EditableFormulaNode>(boxNode: BoxNode, node: N): N => {
	node = assignLayoutAttachedProps(boxNode)(node);

	if (isMathList(node) || isMatrix(node)){
		const boxNodeItems = (boxNode as (BoxMathListNode | BoxMatrixNode)).items;
		node.items = zipWith(boxNodeItems, node.items, combineBoxNodeAndEditableNode);
	}
	else if (isFraction(node)){
		const boxFracNode = boxNode as BoxFractionNode;
		Object.assign(node, {
			numerator: combineBoxNodeAndEditableNode(boxFracNode.numerator, node.numerator),
			denominator: combineBoxNodeAndEditableNode(boxFracNode.denominator, node.denominator),
			rule: assignLayoutAttachedProps(boxFracNode.rule)(node.rule)
		});
	}
	else if (isScript(node)){
		const boxScriptNode = boxNode as BoxScriptNode;
		node.nucleus = combineBoxNodeAndEditableNode(boxScriptNode.nucleus, node.nucleus);
		if (node.sup){
			node.sup = combineBoxNodeAndEditableNode(boxScriptNode.sup, node.sup);
		}
		if (node.sub) {
			node.sub = combineBoxNodeAndEditableNode(boxScriptNode.sub, node.sub);
		}
	}
	else if (isAccented(node)){
		const boxAccentNode = boxNode as BoxAccentNode;
		node.nucleus = combineBoxNodeAndEditableNode(boxAccentNode.nucleus, node.nucleus);
		node.accent = combineBoxNodeAndEditableNode(boxAccentNode.accent, node.accent);
	}
	else if (isRoot(node)){
		const boxRootNode = boxNode as BoxRootNode;
		node.radicand = combineBoxNodeAndEditableNode(boxRootNode.radicand, node.radicand);
		node.radical = assignLayoutAttachedProps(boxRootNode.radical)(node.radical);
		if (node.index){
			node.index = combineBoxNodeAndEditableNode(boxRootNode.index, node.index);
		}
	}
	else if (isDelimited(node)){
		const boxDelimNode = node as BoxDelimitedNode;
		node.delimited = combineBoxNodeAndEditableNode(boxDelimNode.delimited, node.delimited);
		node.leftDelim = assignLayoutAttachedProps(boxDelimNode.leftDelim)(node.leftDelim);
		node.rightDelim = assignLayoutAttachedProps(boxDelimNode.rightDelim)(node.rightDelim);
	}

	return node;
}

export function layoutEditableNode<N extends EditableFormulaNode>(node: N): N {
	return combineBoxNodeAndEditableNode(layout(node), node);
}