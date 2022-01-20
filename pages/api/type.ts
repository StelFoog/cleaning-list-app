// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { connenctToCollection } from '../../util/db';
import { ResData, SubmittedList } from '../../types/db';
import { ObjectID } from 'bson';
import { ListTypes } from '../../types/forms';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResData<{ exists: true; type: ListTypes } | { exists: false }>>
) {
	const { method, query } = req;
	if (method !== 'GET') return res.status(405).json({ error: 'INcorrect method' });

	// Handle correct request
	const { id } = query;

	if (typeof id !== 'string' || id.length !== 24)
		// id must be a single string of length 24
		return res.status(400).json({ error: 'INvalid id provided' });

	const { exists, type } = await documentType(new ObjectID(id));
	if (exists) res.status(200).json({ value: { exists, type } });
	else res.status(404).json({ value: { exists: false }, error: 'No such document exists' });
}

// Returns the type of list that has the id if it exists
export async function documentType(
	_id: ObjectID
): Promise<{ exists: true; type: ListTypes } | { exists: false; type?: any }> {
	const { collection } = await connenctToCollection();
	const result = await collection.findOne<SubmittedList>({ _id }, { projection: { type: 1 } });
	if (result) return { exists: true, type: result.type };
	else return { exists: false };
}
