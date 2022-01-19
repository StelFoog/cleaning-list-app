import { Collection, MongoClient, ObjectId } from 'mongodb';
import { listTypes } from '../util/constants/db';
import { ListTypes } from './forms';

export interface CollectionConnection {
	client: MongoClient;
	collection: Collection;
}

export interface ResData<Data = any> {
	deauthenticated?: true;
	error?: string;
	value?: Data;
}

export type Unchecked = Record<string, Record<string, string[]>>;

export interface SubmittedList {
	_id: ObjectId;
	name: string;
	phone: string;
	eventDate: string;
	host: string;
	omittedChecks: Unchecked;
	note: string | null;
	type: ListTypes;
	version: string;
	timestamp: Date;
}

export type SubmitList = Omit<SubmittedList, '_id'>;

export type SubmittableList = Omit<SubmitList, 'timestamp'>;

export type ListableForm = Omit<SubmittedList, 'phone' | 'omittedChecks' | 'note' | 'timestamp'>;
