import { AccentNode, CharNode, DelimitedNode, FractionNode, MathListNode, MatrixNode, RootNode, ScriptNode, TextNode } from '@flurrux/math-layout-engine/src/types';

//the goal here is to define types so that we can "add" properties to every node in a layout-tree.


export type FormulaNodeWithProps<P> = MathListNodeWithProps<P> | FractionNodeWithProps<P> | ScriptNodeWithProps<P> | AccentNodeWithProps<P> | MatrixNodeWithProps<P> | RootNodeWithProps<P> | DelimitedNodeWithProps<P> | CharNodeWithProps<P> | (TextNode & P);


type CharNodeWithProps<P> = CharNode & P;

export type MathListNodeWithProps<P> = MathListNode & {
	items: FormulaNodeWithProps<P>[]
};
export type FractionNodeWithProps<P> = FractionNode & {
	numerator: FormulaNodeWithProps<P>,
	denominator: FormulaNodeWithProps<P>
};
export type ScriptNodeWithProps<P> = ScriptNode & {
	nucleus: FormulaNodeWithProps<P>,
	sup?: FormulaNodeWithProps<P>,
	sub?: FormulaNodeWithProps<P>
};
export type AccentNodeWithProps<P> = AccentNode & {
	nucleus: FormulaNodeWithProps<P>,
	accent: CharNodeWithProps<P>
};
export type MatrixNodeWithProps<P> = MatrixNode & {
	items: FormulaNodeWithProps<P>[]
};
export type RootNodeWithProps<P> = RootNode & {
	radicand: FormulaNodeWithProps<P>,
	index?: FormulaNodeWithProps<P>
};
export type DelimitedNodeWithProps<P> = DelimitedNode & {
	leftDelim: FormulaNodeWithProps<P>,
	rightDelim: FormulaNodeWithProps<P>,
	delimited: FormulaNodeWithProps<P>
};

