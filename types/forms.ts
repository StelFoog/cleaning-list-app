import { listTypes } from '../util/constants/db';

export type ListTypes = typeof listTypes[number];

export interface CleaningCategory {
	checks: string[];
}

export interface CleaningSuperCatgory {
	categories: Record<string, CleaningCategory>;
}

export interface CleaningMeta {
	colors: Record<string, string>;
}

export interface CleaningList {
	version: string;
	type: ListTypes;
	superCategories: Record<string, CleaningSuperCatgory>;
	meta: CleaningMeta;
}
