
export type OptId = string;

export type IdOwner = {
	id?: string
};

export type WithId<T> = T & {
	id?: OptId,
};

export function getId(node: WithId<object>): OptId {
	return node.id;
}

export function hasId(node: WithId<object>): boolean {
	return getId(node) !== undefined;
}