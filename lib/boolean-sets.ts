import { sort } from "fp-ts/lib/Array";
import { last, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { Ord } from "fp-ts/lib/Ord";
import { Ordering } from "fp-ts/lib/Ordering";


const clusterEquivalentElements = <N>(ord: Ord<N>) => (array: N[]): NonEmptyArray<N>[] => {
	if (array.length === 0) return [];
	array = sort(ord)(array);
	let clusters: NonEmptyArray<NonEmptyArray<N>> = [[array[0]]];
	for (const el of array){
		const prevEl = last(clusters)[0];
		if (ord.equals(prevEl, el)){
			last(clusters).push(el);
		}
		else {
			clusters.push([el]);
		}
	}
	return clusters;
};

type Both<N> = [NonEmptyArray<N>, NonEmptyArray<N>][];

export type BooleanSets<N> = {
	aOnly: N[],
	bOnly: N[],
	both: Both<N>
};

export const partitionIntoBooleanSets = <N>(ord: Ord<N>) => (a: N[], b: N[]): BooleanSets<N> => {
	let aOnly: N[] = [];
	let bOnly: N[] = [];
	let both: Both<N> = [];

	const listA = clusterEquivalentElements(ord)(a);
	const listB = clusterEquivalentElements(ord)(b);

	let indexA = 0;
	let indexB = 0;
	for (let i = 0; i < 10000; i++) {
		const aFinished = indexA === listA.length;
		const bFinished = indexB === listB.length;

		if (aFinished && bFinished) break;

		let clusterA: NonEmptyArray<N> = undefined;
		let clusterB: NonEmptyArray<N> = undefined;
		if (!aFinished) clusterA = listA[indexA];
		if (!bFinished) clusterB = listB[indexB];

		let comparison: Ordering = 0;
		if (aFinished) comparison = +1;
		else if (bFinished) comparison = -1;
		else comparison = ord.compare(clusterA[0], clusterB[0]);

		if (comparison === 0) {
			both.push([clusterA, clusterB]);
			indexA++;
			indexB++;
			continue;
		}

		//itemA is "smaller" than itemB and itemB is smaller than every other item in array `b`.
		//therefore itemA cannot be equal to any item in array `b`
		if (comparison === -1) {
			aOnly.push(...clusterA);
			indexA++;
			continue;
		}

		//itemB is "smaller" than itemA and itemA is smaller than every other item in array `a`.
		//therefore itemB cannot be equal to any item in array `a`
		if (comparison === +1) {
			bOnly.push(...clusterB);
			indexB++;
			continue;
		}
	}

	return { aOnly, bOnly, both };
}