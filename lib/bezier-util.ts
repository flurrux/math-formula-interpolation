import { interpolate } from "./linear-mapping";


type Vector = number[];

const copyVectorArray = <T extends Vector>(array: T[]): T[] => {
    const copied = [];
    for (let i = 0; i < array.length; i++){
        const vec = array[i];
        const copiedVec = [];
        for (let j = 0; j < vec.length; j++){
            copiedVec[j] = vec[j];
        }
        copied[i] = copiedVec;
    }
    return copied;
};
const interpolateVectors = <T extends Vector>(a: T, b: T, t: number): T => {
    const lerped = [] as T;
    for (let i = 0; i < a.length; i++){
        lerped[i] = interpolate(a[i], b[i], t);
    }
    return lerped;
};

export const bezierTuple = <T extends Vector>(points: T[], tupleSize: number, t: number): T[] => {
	const temp = copyVectorArray(points);
	for (let i = 0; i < points.length - tupleSize; i++) {
		for (let j = 0; j < points.length - 1 - i; j++) {
			temp[j] = interpolateVectors(temp[j], temp[j + 1], t);
		}
	}
	return temp.slice(0, tupleSize);
};

export const bezierPoint = <T extends Vector>(points: T[], t: number) : T => {
	return bezierTuple(points, 1, t)[0];
};