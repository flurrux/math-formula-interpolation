import { AccentNode, CharNode, ContoursNode, DelimitedNode, FormulaNode, FractionNode, MathListNode, RootNode, RuleNode, ScriptNode, TextNode, TextualType } from "@flurrux/math-layout-engine/src/types";
import { unicodeToTypeMap } from "@flurrux/math-layout-engine/src/type-from-unicode";
import { IdOwner, OptId, WithId } from "../lib/with-id";
import { InterpolationProps, WithInterpolationProps } from "./interpolation-props";
import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { BoxTextNode } from "@flurrux/math-layout-engine/src/layout/text-layout";
import { BoxMathListNode } from "@flurrux/math-layout-engine/src/layout/mathlist-layout";
import { BoxFractionNode } from "@flurrux/math-layout-engine/src/layout/fraction-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { BoxAccentNode } from "@flurrux/math-layout-engine/src/layout/accent-layout";
import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxDelimitedNode } from "@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout";

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


export function char(value: string, id: string = undefined, props: InterpolationProps<BoxCharNode> = undefined): WithInterpolationProps<CharNode, BoxCharNode> {
	const unicode = value.charCodeAt(0);
	const nodeType = getNodeTypeByUnicode(unicode);
	let node: WithInterpolationProps<CharNode, BoxCharNode> = {
		type: nodeType,
		value: String.fromCharCode(unicode)
	};
	node = insertIdAndProps(id, props)(node);
	return node;
}

export function text(value: string, id: string = undefined, props: InterpolationProps<BoxTextNode> = undefined): WithInterpolationProps<TextNode, BoxTextNode> {
	let node: WithInterpolationProps<TextNode, BoxTextNode> = {
		type: "ord",
		text: value
	};
	node = insertIdAndProps(id, props)(node);
	return node;
}

export function mathList(items: FormulaNode[], id: string = undefined, props: InterpolationProps<BoxMathListNode> = undefined): WithInterpolationProps<MathListNode, BoxMathListNode> {
	return insertIdAndProps<BoxMathListNode>(id, props)({
		type: "mathlist",
		items
	} as MathListNode);
}

type InterpolatableFractionNode = FractionNode & InterpolationProps<BoxFractionNode> & { ruleProps?: InterpolationProps<RuleNode> };
export function fraction(num: FormulaNode, den: FormulaNode, id: string = undefined, props: InterpolationProps<{}>, ruleProps: InterpolationProps<RuleNode>): InterpolatableFractionNode {
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

export function script(nucleus: FormulaNode, sup: FormulaNode | undefined, sub: FormulaNode | undefined, id: string = undefined, props: InterpolationProps<BoxScriptNode>): WithInterpolationProps<ScriptNode, BoxScriptNode> {
	let node: WithInterpolationProps<ScriptNode, BoxScriptNode> = {
		type: "script",
		nucleus
	};
	node = insertIdAndProps(id, props)(node);

	if (sup) node.sup = sup;
	if (sub) node.sub = sub;

	return node;
};

export function accented(nucleus: FormulaNode, accent: CharNode, id: string = undefined, props: InterpolationProps<BoxAccentNode>): WithInterpolationProps<AccentNode, BoxAccentNode> {
	return insertIdAndProps<BoxAccentNode>(id, props)({
		type: "accented",
		nucleus, accent
	} as AccentNode); 
};

type InterpolatableRootNode = RootNode & InterpolationProps<BoxRootNode> & { radicalProps?: InterpolationProps<ContoursNode> };
export function root(radicand: FormulaNode, index: FormulaNode = undefined, id: string = undefined, props: InterpolationProps<BoxRootNode>, radicalProps: InterpolationProps<ContoursNode>): InterpolatableRootNode {
	let node: InterpolatableRootNode = {
		type: "root",
		radicand
	};
	node = insertIdAndProps(id, props)(node);
	if (index !== undefined) node.index = index;
	if (radicalProps !== undefined) node.radicalProps = radicalProps;
	return node;
};

export function delimit(leftDelim: FormulaNode, delimited: FormulaNode, rightDelim: FormulaNode, id: string = undefined, props: InterpolationProps<BoxDelimitedNode>): WithInterpolationProps<DelimitedNode, BoxDelimitedNode> {
	return insertIdAndProps(id, props)({
		type: "delimited",
		leftDelim, rightDelim,
		delimited
	})
};