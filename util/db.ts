import { MongoClient } from 'mongodb';
import { CollectionConnection } from '../types/db';

const { NAME, PASSWORD, CLUSTER, DATABASE } = process.env;

const URL = `mongodb+srv://${NAME}:${PASSWORD}@${CLUSTER}/${DATABASE}?retryWrites=true&w=majority`;

// @ts-ignore
let cached = global.mongodb; // Handle cached connection
// @ts-ignore
if (!cached) cached = global.mongodb = { conn: null, promise: null }; // If nothing is cached create object

export async function connenctToCollection(): Promise<CollectionConnection> {
	const collection = 'submitted';
	if (cached.conn) return cached.conn; // return the cached connection

	if (!cached.promise) {
		// create the connection promise
		cached.promise = MongoClient.connect(URL).then((client) => ({
			client,
			collection: client.db(DATABASE).collection(collection),
		}));
	}
	cached.conn = await cached.promise; // wait for promise to resolve
	return cached.conn; // return client and collection
}
