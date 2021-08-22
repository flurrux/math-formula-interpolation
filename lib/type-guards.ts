import { isNodeChar, isNodeText, isNodeTextual } from "@flurrux/math-layout-engine/src/node-types";
import { AccentNode, BoxNode, CharNode, ContoursNode, DelimitedNode, FormulaNode, FractionNode, MathListNode, MatrixNode, RootNode, RuleNode, ScriptNode, TextNode, TextualNode } from "@flurrux/math-layout-engine/src/types";
import { BoxMathListNode } from "@flurrux/math-layout-engine/src/layout/mathlist-layout";
import { BoxFractionNode } from "@flurrux/math-layout-engine/src/layout/fraction-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { BoxAccentNode } from "@flurrux/math-layout-engine/src/layout/accent-layout";
import { BoxMatrixNode } from "@flurrux/math-layout-engine/src/layout/matrix-layout";
import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxDelimitedNode } from "@flurrux/math-layout-engine/src/layout/delimiter/delimited-layout";
import { BoxCharNode } from "@flurrux/math-layout-engine/src/layout/char-layout";
import { BoxTextNode } from "@flurrux/math-layout-engine/src/layout/text-layout";

//formula-types ###

export const isCharNode = (node: FormulaNode): node is CharNode => isNodeChar(node);
export const isTextNode = (node: FormulaNode): node is TextNode => isNodeText(node);
export const isTextualNode = (node: FormulaNode): node is TextualNode => isNodeTextual(node);
export const isMathList = (node: FormulaNode): node is MathListNode => node.type === "mathlist";
export const isFraction = (node: FormulaNode): node is FractionNode => node.type === "fraction";
export const isRoot = (node: FormulaNode): node is RootNode => node.type === "root";
export const isScript = (node: FormulaNode): node is ScriptNode => node.type === "script";
export const isAccented = (node: FormulaNode): node is AccentNode => node.type === "accented";
export const isDelimited = (node: FormulaNode): node is DelimitedNode => node.type === "delimited";
export const isMatrix = (node: FormulaNode): node is MatrixNode => node.type === "matrix";


//layout-types ###


export const isMathListLayout = (node: BoxNode): node is BoxMathListNode => node.type === "mathlist";
export const isFractionLayout = (node: BoxNode): node is BoxFractionNode => node.type === "fraction";
export const isScriptLayout = (node: BoxNode): node is BoxScriptNode => node.type === "script";
export const isAccentedLayout = (node: BoxNode): node is BoxAccentNode => node.type === "accented";
export const isMatrixLayout = (node: BoxNode): node is BoxMatrixNode => node.type === "matrix";
export const isRootLayout = (node: BoxNode): node is BoxRootNode => node.type === "root";
export const isDelimitedLayout = (node: BoxNode): node is BoxDelimitedNode => node.type === "delimited";
export const isContour = (node: BoxNode): node is ContoursNode => node.type === "contours";
export const isRule = (node: BoxNode): node is RuleNode => node.type === "rule";
export const isCharLayout = (node: BoxNode): node is BoxCharNode => node.type === "char";
export const isTextLayout = (node: BoxNode): node is BoxTextNode => node.type === "text";