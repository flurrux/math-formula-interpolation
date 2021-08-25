import { BoxAccentNode } from '@flurrux/math-layout-engine/src/layout/accent-layout';
import { BoxCharNode } from '@flurrux/math-layout-engine/src/layout/char-layout';
import { BoxDelimitedNode } from '@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout';
import { BoxFractionNode } from '@flurrux/math-layout-engine/src/layout/fraction-layout';
import { BoxMathListNode } from '@flurrux/math-layout-engine/src/layout/mathlist-layout';
import { BoxMatrixNode } from '@flurrux/math-layout-engine/src/layout/matrix-layout';
import { BoxRootNode } from '@flurrux/math-layout-engine/src/layout/root/root-layout';
import { BoxScriptNode } from '@flurrux/math-layout-engine/src/layout/script/script-layout';
import { BoxTextNode } from '@flurrux/math-layout-engine/src/layout/text-layout';
import { ContoursNode, RuleNode } from '@flurrux/math-layout-engine/src/types';

export type BoxNodeWithProps<P> = BoxCharNodeWithProps<P> | (BoxTextNode & P) | BoxMathListNodeWithProps<P> | BoxFractionNodeWithProps<P> | BoxScriptNodeWithProps<P> | BoxAccentNodeWithProps<P> | BoxMatrixNodeWithProps<P> | BoxRootNodeWithProps<P> | BoxDelimitedNodeWithProps<P> | ContoursNodeWithProps<P> | RuleNodeWithProps<P>;

type ContoursNodeWithProps<P> = ContoursNode & P;
type BoxCharNodeWithProps<P> = BoxCharNode & P;

export type BoxMathListNodeWithProps<P> = BoxMathListNode & P & {
	items: BoxNodeWithProps<P>[]
};
export type RuleNodeWithProps<P> = RuleNode & P;
export type BoxFractionNodeWithProps<P> = BoxFractionNode & P & {
	numerator: BoxNodeWithProps<P>,
	denominator: BoxNodeWithProps<P>,
	rule: RuleNodeWithProps<P>
};
export type BoxScriptNodeWithProps<P> = BoxScriptNode & P & {
	nucleus: BoxNodeWithProps<P>,
	sup?: BoxNodeWithProps<P>,
	sub?: BoxNodeWithProps<P>
};
export type BoxAccentNodeWithProps<P> = BoxAccentNode & P & {
	nucleus: BoxNodeWithProps<P>,
	accent: BoxCharNodeWithProps<P>
};
export type BoxMatrixNodeWithProps<P> = BoxMatrixNode & P & {
	items: BoxNodeWithProps<P>[]
};
export type BoxRootNodeWithProps<P> = BoxRootNode & P & {
	radicand: BoxNodeWithProps<P>,
	radical: ContoursNodeWithProps<P>,
	index?: BoxNodeWithProps<P>
};
export type BoxDelimitedNodeWithProps<P> = BoxDelimitedNode & P & {
	leftDelim: ContoursNodeWithProps<P>,
	rightDelim: ContoursNodeWithProps<P>,
	delimited: BoxNodeWithProps<P>
};