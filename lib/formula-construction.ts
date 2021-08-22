import { AccentNode, CharNode, DelimitedNode, FormulaNode, FractionNode, MathListNode, RootNode, ScriptNode, TextNode, TextualType } from "@flurrux/math-layout-engine/src/types";
import { unicodeToTypeMap } from "@flurrux/math-layout-engine/src/type-from-unicode";

const getNodeTypeByUnicode = (unicode: number): TextualType => {
	return unicodeToTypeMap[unicode] || "ord";
};

type OptId = string | undefined;

type WithId<T> = T & {
	id: OptId,
};

export function char(value: string, id: string = undefined): WithId<CharNode> {
	const unicode = value.charCodeAt(0);
	const nodeType = getNodeTypeByUnicode(unicode);
	return {
		id,
		type: nodeType,
		value: String.fromCharCode(unicode),
	};
}

export function text(value: string, id: string = undefined): WithId<TextNode> {
	return {
		id, 
		type: "ord",
		text: value
	}
}

export function mathList(items: FormulaNode[], id: string = undefined): WithId<MathListNode> {
	return {
		id,
		type: "mathlist",
		items
	}
}

export function fraction(num: FormulaNode, den: FormulaNode, id: string = undefined, ruleId: string = undefined): WithId<FractionNode> & { ruleId?: OptId } {
	return {
		id, ruleId,
		type: "fraction",
		numerator: num,
		denominator: den
	}
};

export function script(nucleus: FormulaNode, sup: FormulaNode | undefined, sub: FormulaNode | undefined, id: string = undefined): WithId<ScriptNode> {
	let scriptNode: ScriptNode = {
		type: "script",
		nucleus
	};
	if (sup) {
		scriptNode.sup = sup;
	}
	if (sub) {
		scriptNode.sub = sub;
	}
	return {
		...scriptNode,
		id
	}
};

export function accented(nucleus: FormulaNode, accent: CharNode, id: string = undefined): WithId<AccentNode> {
	return {
		id,
		type: "accented",
		nucleus, accent
	}
};

export function root(radicand: FormulaNode, index: FormulaNode | undefined, id: string = undefined, radicalId: OptId = undefined): WithId<RootNode> & { radicalId: OptId } {
	return {
		id, radicalId,
		type: "root",
		radicand,
		...(
			index ? ({ index }) : {}
		)
	}
};

export function delimit(leftDelim: FormulaNode, delimited: FormulaNode, rightDelim: FormulaNode, id: string = undefined): WithId<DelimitedNode> {
	return {
		id,
		type: "delimited",
		leftDelim, rightDelim,
		delimited
	}
};