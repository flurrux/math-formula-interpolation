import { BoxRootNode } from "@flurrux/math-layout-engine/src/layout/root/root-layout";
import { BoxScriptNode } from "@flurrux/math-layout-engine/src/layout/script/script-layout";
import { BoxNode, FormulaNode, RootNode, ScriptNode } from "@flurrux/math-layout-engine/src/types";
import { isAccented, isAccentedLayout, isDelimited, isDelimitedLayout, isFraction, isFractionLayout, isMathList, isMathListLayout, isMatrix, isMatrixLayout, isRoot, isRootLayout, isScript, isScriptLayout, isTextualNode } from "./type-guards";
import { PropertyPath } from "./types";

//formula ###

function getScriptFormulaChildren(node: ScriptNode): FormulaNode[] {
	let children: FormulaNode[] = [node.nucleus];
	if (node.sup) children.push(node.sup);
	if (node.sub) children.push(node.sub);
	return children;
}

function getRootFormulaChildren(node: RootNode): FormulaNode[] {
	let children: FormulaNode[] = [node.radicand];
	if (node.index) children.push(node.index);
	return children;
}

export function getFormulaChildPaths(node: FormulaNode): PropertyPath[] {
	if (isMathList(node)) return node.items.map((v, j) => ["items", j]);
	if (isScript(node)) return [["nucleus"], ["sup"], ["sub"]];
	if (isFraction(node)) return [["numerator"], ["denominator"]];
	if (isRoot(node)) return [["radicand"], ["index"]];
	if (isAccented(node)) return [["nucleus"], ["accent"]];
	if (isDelimited(node)) return [["leftDelim"], ["delimited"], ["rightDelim"]];
	if (isMatrix(node)) return node.items.map((v, j) => ["items", j]);
	return [];
}

export function getFormulaChildNodes(node: FormulaNode): FormulaNode[] {
	if (isMathList(node)) return node.items;
	if (isScript(node)) return getScriptFormulaChildren(node);
	if (isFraction(node)) return [node.numerator, node.denominator];
	if (isRoot(node)) return getRootFormulaChildren(node);
	if (isAccented(node)) return [node.nucleus, node.accent];
	if (isDelimited(node)) return [node.leftDelim, node.delimited, node.rightDelim];
	if (isMatrix(node)) return node.items;
	return [];
}


//layout ###

function getScriptLayoutChildren(node: BoxScriptNode): BoxNode[] {
	let children: BoxNode[] = [node.nucleus];
	if (node.sup) children.push(node.sup);
	if (node.sub) children.push(node.sub);
	return children;
}

function getRootLayoutChildren(node: BoxRootNode): BoxNode[] {
	let children: BoxNode[] = [node.radicand, node.radical];
	if (node.index) children.push(node.index);
	return children;
}

export function getLayoutChildNodes(node: BoxNode): BoxNode[] {
	if (isMathListLayout(node)) return node.items;
	if (isFractionLayout(node)) return [node.numerator, node.rule, node.denominator];
	if (isScriptLayout(node)) return getScriptLayoutChildren(node);
	if (isAccentedLayout(node)) return [node.nucleus, node.accent];
	if (isMatrixLayout(node)) return node.items;
	if (isRootLayout(node)) return getRootLayoutChildren(node);
	if (isDelimitedLayout(node)) return [node.leftDelim, node.delimited, node.rightDelim];
	return [];
}

export function getLayoutChildPaths(node: FormulaNode): PropertyPath[] {
	if (isMathList(node)) return node.items.map((v, j) => ["items", j]);
	if (isScript(node)) return [["nucleus"], ["sup"], ["sub"]];
	if (isFraction(node)) return [["numerator"], ["denominator"], ["rule"]];
	if (isRoot(node)) return [["radicand"], ["radical"], ["index"]];
	if (isAccented(node)) return [["nucleus"], ["accent"]];
	if (isDelimited(node)) return [["leftDelim"], ["delimited"], ["rightDelim"]];
	if (isMatrix(node)) return node.items.map((v, j) => ["items", j]);
	return [];
}