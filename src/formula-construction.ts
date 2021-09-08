import { BoxAccentNode } from "@flurrux/math-layout-engine/src/layout/accent-layout";
import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { BoxDelimitedNode } from "@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout";
import { BoxFractionNode } from "@flurrux/math-layout-engine/src/layout/fraction-layout";
import { BoxMathListNode } from "@flurrux/math-layout-engine/src/layout/mathlist-layout";
import { BoxMatrixNode } from "@flurrux/math-layout-engine/src/layout/matrix-layout";
import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { BoxTextNode } from "@flurrux/math-layout-engine/src/layout/text-layout";
import { unicodeToTypeMap } from "@flurrux/math-layout-engine/src/type-from-unicode";
import { AccentNode, CharNode, ContoursNode, DelimitedNode, FractionNode, MathListNode, MatrixNode, MatrixStyle, RootNode, RuleNode, ScriptNode, TextNode, TextualType } from "@flurrux/math-layout-engine/src/types";
import { InterpolationProps, WithInterpolationProps } from "./interpolation-props";


export type InterpolatableFormulaNode = InterpolatableCharNode | InterpolatableTextNode | InterpolatableMathList | InterpolatableFractionNode | InterpolatableScriptNode | InterpolatableAccentNode | InterpolatableRootNode | InterpolatableDelimitedNode | InterpolatableMatrixNode;


const getNodeTypeByUnicode = (unicode: number): TextualType => {
	return unicodeToTypeMap[unicode] || "ord";
};

const insertIdAndProps = <B>(id: string = undefined, props: InterpolationProps<B> = undefined) => <A>(node: A): WithInterpolationProps<A, B> => {
	let nodeWithProps: WithInterpolationProps<A, B> = { ...node };
	if (id !== undefined) {
		nodeWithProps.id = id;
	}
	if (props !== undefined) {
		Object.assign(nodeWithProps, props);
	}
	return nodeWithProps;
}

type InterpolatableCharNode = WithInterpolationProps<CharNode, BoxCharNode>;

export function char(
	value: string, 
	id: string = undefined, 
	props: InterpolationProps<BoxCharNode> = undefined): InterpolatableCharNode {
	
	const unicode = value.charCodeAt(0);
	const nodeType = getNodeTypeByUnicode(unicode);
	let node: InterpolatableCharNode = {
		type: nodeType,
		value: String.fromCharCode(unicode)
	};
	node = insertIdAndProps(id, props)(node);
	return node;
}


type InterpolatableTextNode = WithInterpolationProps<TextNode, BoxTextNode>;

export function text(
	value: string, 
	id: string = undefined, 
	props: InterpolationProps<BoxTextNode> = undefined): InterpolatableTextNode {
	
	let node: InterpolatableTextNode = {
		type: "ord",
		text: value
	};
	node = insertIdAndProps(id, props)(node);
	return node;
}


type InterpolatableMathList = WithInterpolationProps<
	MathListNode & { items: InterpolatableFormulaNode[] }, 
	BoxMathListNode
>;

export function mathList(
	items: InterpolatableFormulaNode[], 
	id: string = undefined, 
	props: InterpolationProps<BoxMathListNode> = undefined): InterpolatableMathList {

	return insertIdAndProps<BoxMathListNode>(id, props)({
		type: "mathlist",
		items
	});
}


type InterpolatableFractionNode = FractionNode & InterpolationProps<BoxFractionNode> & { ruleProps?: InterpolationProps<RuleNode> } & {
	numerator: InterpolatableFormulaNode, 
	denominator: InterpolatableFormulaNode
};

export function fraction(
	num: InterpolatableFormulaNode, 
	den: InterpolatableFormulaNode, 
	id: string = undefined, 
	props: InterpolationProps<BoxFractionNode> = undefined, 
	ruleProps: InterpolationProps<RuleNode> = undefined): InterpolatableFractionNode {

	let node: InterpolatableFractionNode = {
		type: "fraction",
		numerator: num,
		denominator: den
	};
	node = insertIdAndProps(id, props)(node);
	if (ruleProps !== undefined){
		node.ruleProps = ruleProps;
	}
	return node;
};


type InterpolatableScriptNode = WithInterpolationProps<
	ScriptNode & { 
		nucleus: InterpolatableFormulaNode, 
		sup?: InterpolatableFormulaNode, 
		sub?: InterpolatableFormulaNode 
	}, 
	BoxScriptNode
>;

export function script(
	nucleus: InterpolatableFormulaNode, 
	sup: InterpolatableFormulaNode | undefined, 
	sub: InterpolatableFormulaNode | undefined, 
	id: string = undefined, 
	props: InterpolationProps<BoxScriptNode> = undefined): InterpolatableScriptNode {

	let node: InterpolatableScriptNode = {
		type: "script",
		nucleus
	};
	node = insertIdAndProps(id, props)(node);

	if (sup) node.sup = sup;
	if (sub) node.sub = sub;

	return node;
};


type InterpolatableAccentNode = WithInterpolationProps<
	AccentNode & {
		nucleus: InterpolatableFormulaNode,
		accent: InterpolatableCharNode
	}, 
	BoxAccentNode
>;

export function accented(
	nucleus: InterpolatableFormulaNode, 
	accent: InterpolatableCharNode,
	id: string = undefined, 
	props: InterpolationProps<BoxAccentNode> = undefined): InterpolatableAccentNode {
	
	return insertIdAndProps<BoxAccentNode>(id, props)({
		type: "accented",
		nucleus, accent
	}); 
};


type InterpolatableRootNode = RootNode & InterpolationProps<BoxRootNode> & { radicalProps?: InterpolationProps<ContoursNode> } & {
	radicand: InterpolatableFormulaNode, 
	index?: InterpolatableFormulaNode
};

export function root(
	radicand: InterpolatableFormulaNode, 
	index: InterpolatableFormulaNode = undefined, 
	id: string = undefined, 
	props: InterpolationProps<BoxRootNode> = undefined, 
	radicalProps: InterpolationProps<ContoursNode> = undefined): InterpolatableRootNode {

	let node: InterpolatableRootNode = {
		type: "root",
		radicand
	};
	node = insertIdAndProps(id, props)(node);
	if (index !== undefined) node.index = index;
	if (radicalProps !== undefined) node.radicalProps = radicalProps;
	return node;
};


type InterpolatableDelimitedNode = WithInterpolationProps<
	DelimitedNode & {
		leftDelim: InterpolatableCharNode, 
		delimited: InterpolatableFormulaNode,
		rightDelim: InterpolatableCharNode
	}, 
	BoxDelimitedNode
>;

export function delimit(
	leftDelim: InterpolatableCharNode,
	delimited: InterpolatableFormulaNode,
	rightDelim: InterpolatableCharNode,
	id: string = undefined, 
	props: InterpolationProps<BoxDelimitedNode> = {}): InterpolatableDelimitedNode {
	
	return insertIdAndProps(id, props)({
		type: "delimited",
		leftDelim, rightDelim,
		delimited
	})
};



type InterpolatableMatrixNode = WithInterpolationProps<
	MatrixNode & { items: InterpolatableFormulaNode[] },
	BoxMatrixNode
>;

export function matrix(items: InterpolatableFormulaNode[], rowCount: number, colCount: number, style: MatrixStyle, id: string = undefined, props: InterpolationProps<BoxMatrixNode> = {}): InterpolatableMatrixNode {
	return insertIdAndProps(id, props)({
		type: "matrix",
		items, style,
		rowCount, colCount,
	})
}