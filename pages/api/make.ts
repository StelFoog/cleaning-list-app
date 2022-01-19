// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { connenctToCollection } from '../../util/db';
import { authorize } from '../../util/authorize';
import { SubmittableList as ReqData, SubmitList, ResData } from '../../types/db';
import { listTypes } from '../../util/constants/db';
import { ISO_DATE_NO_DASH } from '../../util/date';

function isValidBody(body: any): body is ReqData {
	return (
		typeof body === 'object' &&
		typeof (body as ReqData).name === 'string' &&
		typeof (body as ReqData).phone === 'string' &&
		typeof (body as ReqData).eventDate === 'string' &&
		!!(body as ReqData).eventDate.match(ISO_DATE_NO_DASH) &&
		typeof (body as ReqData).host === 'string' &&
		typeof (body as ReqData).omittedChecks === 'object' &&
		(typeof (body as ReqData).note === 'string' || (body as ReqData).note === null) &&
		listTypes.includes((body as ReqData).type) &&
		typeof (body as ReqData).version === 'string'
	);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResData<string>>) {
	const { method, headers, body } = req;
	if (method !== 'PUT') {
		res.status(405).json({ error: 'INcorrect method' });
		return;
	}
	if (!authorize(headers.authorization)) {
		res.status(401).json({ error: 'INvalid authorization header', deauthenticated: true });
		return;
	}
	if (!body) {
		res.status(400).json({ error: 'Missing body' });
		return;
	}
	if (!isValidBody(body)) {
		res.status(400).json({ error: 'Body data is INcomplete' });
		return;
	}

	// Handle correct request
	const { collection } = await connenctToCollection();
	const doc: SubmitList = { ...body, timestamp: new Date() };
	const result = await collection.insertOne(doc);
	if (!result)
		return res.status(400).json({ error: 'An unknown error uccured while creating the document' });

	console.log('Created document', { _id: result.insertedId, ...doc });
	res.status(201).json({ value: result.insertedId.toString() });
}
