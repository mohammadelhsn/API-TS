import express from 'express';
import Routes from './Routes';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
const client = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', true);

app.use((req, res, next) => next());

app.use('/', Routes);

app.listen(process.env.PORT || 3000, () => {
	console.log(`Running app on #3000`);
});

client.connect((err, client) => {
	if (err) console.log(err);
	globalThis.client = client;
});
