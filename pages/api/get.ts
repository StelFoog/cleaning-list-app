// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { connenctToCollection } from '../../util/db';
import { authorize } from '../../util/authorize';
import { ListableForm, ResData, SubmittedList } from '../../types/db';
import { Document, ObjectId } from 'bson';
import { Collection } from 'mongodb';
import { FETCH_LIMIT } from '../../util/constants/db';

const PROJECTION = {
	phone: 0,
	omittedChecks: 0,
	note: 0,
	timestamp: 0,
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResData<SubmittedList | ListableForm>>
) {
	const { method, headers, query } = req;
	if (method !== 'GET') {
		res.status(405).json({ error: 'INcorrect method' });
		return;
	}
	if (!authorize(headers.authorization)) {
		res.status(401).json({ error: 'INvalid authorization header', deauthenticated: true });
		return;
	}

	// Handle correct request
	const { offset = '0', id, name } = query;

	if (id && name)
		// Not allowed to search for an ID and a name at the same time
		return res.status(400).json({ error: 'Search for ID and name at the same time not allowed' });

	const { collection } = await connenctToCollection();
	if (id) {
		// get specific ID
		const [status, json] = await getFromId(collection, id);
		res.status(status).json(json);
	} else {
		// Convert offset to a skip number, defaults to 0
		if (typeof offset !== 'string' || isNaN(Number(offset)))
			return res.status(400).json({ error: 'INvalid offset query' });
		const skip = Number(offset);

		if (name) {
			// Get the 20 latest based on a name search
			const [status, json] = await searchName(collection, name);
			res.status(status).json(json);
		} else {
			// Get the 20 latest, no filter
			const [status, json] = await getLatest(collection, skip);
			res.status(status).json(json);
		}
	}
}

async function getFromId(
	collection: Collection<Document>,
	id: string | string[]
): Promise<[number, ResData]> {
	if (typeof id !== 'string') {
		return [400, { error: 'ID is not valid' }];
	}
	const result = await collection.findOne<SubmittedList>({ _id: new ObjectId(id) });
	if (result) return [200, { value: result }];
	return [404, { error: `Document with _id ${id} does not exist` }];
}

async function searchName(
	collection: Collection<Document>,
	name: string | string[],
	skip: number = 0
): Promise<[number, ResData]> {
	if (typeof name !== 'string') return [400, { error: 'Name is not valid' }];

	const result = await collection
		.find<ListableForm>({ name: new RegExp(name, 'i') })
		.project(PROJECTION)
		.sort('timestamp', -1)
		.skip(skip)
		.limit(FETCH_LIMIT)
		.toArray();

	return [200, { value: result }];
}

async function getLatest(
	collection: Collection<Document>,
	skip: number = 0
): Promise<[number, ResData]> {
	const value = await collection
		.find<ListableForm>({})
		.project(PROJECTION)
		.sort('timestamp', -1)
		.skip(skip)
		.limit(FETCH_LIMIT)
		.toArray();
	return [200, { value }];
}
