import { listTypes } from '../util/constants/db';

export type ListTypes = typeof listTypes[number];

export interface CleaningCategory {
	title: string | null;
	checks: string[];
}

export interface CleaningSuperCatgory {
	title: string;
	categories: Record<string, CleaningCategory>;
	note: string | null;
}

export interface CleaningMeta {
	colors: Record<string, string>;
}

export interface CleaningList {
	version: string;
	type: ListTypes;
	title: string;
	superCategories: Record<string, CleaningSuperCatgory>;
	meta: CleaningMeta;
}
