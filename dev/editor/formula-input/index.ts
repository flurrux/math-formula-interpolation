import { mathList, char } from '../../../src/formula-construction';
import { layoutEditableNode } from '../editable-layout';

//ideas: 
//- selection & deletion of nodes
//- add empty boxes for things like supscripts that have not been filled in
//- option to add nodes inbetween items of mathlists
//- option for selected node to be turned into a script or radicand or whatever
//- drag and drop existing nodes to somewhere else
//- change font-style of node
//- when typing a single symbol, we get one charnode but when typing another symbol, we should get a mathlist of the different nodes
//- type `^` to make the previous node a script
//- ctrl-click on an empty box to show the symbol picker or something
//- a toolbar with different composite nodes that can be instantiate with empty boxes


const testNode = layoutEditableNode(
	mathList([
		char("a"), 
		char("+"),
		char("b")
	])
);


