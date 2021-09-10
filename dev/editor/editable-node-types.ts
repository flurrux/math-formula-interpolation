
import { Style } from '@flurrux/math-layout-engine/src/style';
import { AccentNode, CharNode, ContoursNode, DelimitedNode, FractionNode, MathListNode, MatrixNode, RootNode, RuleNode, ScriptNode, TextNode } from '@flurrux/math-layout-engine/src/types';

export type LayoutAttachedProps = {
	selected?: boolean,
	position: [number, number],
	dimensions: {
		width: number,
		yMin: number,
		yMax: number
	}
};

export type EditorNodeProps = LayoutAttachedProps & {
	id: string,
	style?: Style
};

export type EditableFormulaNode = EditableCharNode | EditableTextNode | EditableMathListNode | EditableFractionNode | EditableScriptNode | EditableAccentNode | EditableMatrixNode | EditableMatrixNode | EditableDelimitedNode | EditableRootNode;

export type EditableContoursNode = ContoursNode & EditorNodeProps;
export type EditableCharNode = CharNode & EditorNodeProps;
export type EditableTextNode = TextNode & EditorNodeProps;
export type EditableMathListNode = MathListNode & EditorNodeProps & {
	items: EditableFormulaNode[]
};
export type EditableRuleNode = RuleNode & EditorNodeProps;
export type EditableFractionNode = FractionNode & EditorNodeProps & {
	numerator: EditableFormulaNode,
	denominator: EditableFormulaNode,
	rule: EditableRuleNode
};
export type EditableScriptNode = ScriptNode & EditorNodeProps & {
	nucleus: EditableFormulaNode,
	sup?: EditableFormulaNode,
	sub?: EditableFormulaNode
};
export type EditableAccentNode = AccentNode & EditorNodeProps & {
	nucleus: EditableFormulaNode,
	accent: EditableCharNode
};
export type EditableMatrixNode = MatrixNode & EditorNodeProps & {
	items: EditableFormulaNode[]
};
export type EditableRootNode = RootNode & EditorNodeProps & {
	radicand: EditableFormulaNode,
	index?: EditableFormulaNode,
	radical: EditableContoursNode
};
export type EditableDelimiterNode = ContoursNode & EditorNodeProps & {
	char: string
};
export type EditableDelimitedNode = DelimitedNode & EditorNodeProps & {
	leftDelim: EditableDelimiterNode,
	rightDelim: EditableDelimiterNode,
	delimited: EditableFormulaNode
};