import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';
import { Base, Snowflake } from 'discord.js';
import { PoolClient, Pool } from 'pg';

const client = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

client.connect();

const router = Router();

const { Utils, Funcs } = Functions;

router.use((req, res, next) => {
	next();
});

router.get('/', (req, res) => {
	res.json({
		docs: 'Not available',
		endpoints: `https://processversion.herokuapp.com/endpoints`,
	});
});

router.get('/endpoints', (req, res) => {
	res.json([
		{ path: '/test', methods: ['GET'], params: 'None', status: 'Working' },
		{
			path: '/roblox',
			methods: ['GET'],
			params: [
				{ name: 'username', type: 'string', description: 'The users username' },
			],
			status: 'Working',
		},
		{
			path: '/discord',
			methods: ['GET'],
			params: [{ name: 'ID', type: 'string', description: 'The users ID' }],
			status: 'Working',
		},
	]);
});

router.get(`/roblox/`, async (req, res) => {
	if (!req.query.username) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing username query',
				data: null,
			})
		);
	}

	const username = req.query.username as string;

	const { Roblox } = new Funcs();

	return res.json(await Roblox(username));
});

router.get('/discord/', async (req, res) => {
	if (!req.query.id) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing username query',
				data: null,
			})
		);
	}

	const id = req.query.id as string;

	const { Discord } = new Funcs();

	return res.json(await Discord(id));
});

router.get('/subreddit/', async (req, res) => {
	if (!req.query.subreddit) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing subreddit query',
				data: null,
			})
		);
	}

	const subreddit = req.query.subreddit as string;

	const { Subreddit } = new Funcs();
	return res.json(await Subreddit(subreddit));
});

router.get('/reddit/', async (req, res) => {
	if (!req.query.user) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing user query',
				data: null,
			})
		);
	}

	const user = req.query.user as string;

	const { User } = new Funcs();
	return res.json(await User(user));
});

router.get('/reverse/', (req, res) => {
	try {
		if (!req.query.text) {
			return res.json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Missing text query',
					data: null,
				})
			);
		}

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: { text: new Funcs().reverse(req.query.text) },
			})
		);
	} catch (error) {
		console.log(error);
	}
});

router.get('/user/', async (req, res) => {
	if (!req.query.id) {
		return res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing id query',
				data: null,
			})
		);
	}

	const request = await client.query(
		`SELECT * FROM ApiUser WHERE id = '${req.body.id}'`
	);

	if (request.rows.length == 0 || !request.rows[0]?.id) {
		return res.json(
			new BaseObj({
				success: false,
				status: 404,
				statusMessage: "This user doesn't exist in the database",
			})
		);
	}

	const index = request.rows[0];

	const data = {
		id: index.id,
		key: index.apikey,
		ip: index.ips,
	};

	return res.json(
		new BaseObj({
			success: true,
			status: 200,
			statusMessage: 'OK',
			data: data,
		})
	);
});

router.post('/user/', async (req, res) => {
	try {
		const request = await client.query(
			`SELECT * FROM ApiUser WHERE id = '${req.body.id}'`
		);

		if (request.rows.length != 0 || request.rows[0]?.id) {
			return res.json(
				new BaseObj({
					success: false,
					status: null,
					statusMessage: 'This user already exists in the database!',
				})
			);
		}

		if (!req.body?.id || !req.body?.key) {
			return res.json(
				new BaseObj({
					success: false,
					status: null,
					statusMessage: 'Incorrect format',
					data: null,
				})
			);
		}

		const testData = await client.query(
			`INSERT INTO ApiUser(id, apikey, ips) VALUES('${req.body.id}', '${req.body.key}', '${req.ip}') RETURNING *`
		);

		const data = {
			id: testData.rows[0].id,
			key: testData.rows[0].apikey,
			ip: testData.rows[0].ips,
		};

		return res.json(data);
	} catch (error) {
		console.log(error);
	}
});

router.patch('/user/', (req, res) => {
	if (!req.body) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Missing a required param',
		});
	}

	if (!req.body.id || !req.body.key) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Incorrect format',
		});
	}

	const id = req.body.id;
	const key = req.body.key;
});

router.delete('/user/', (req, res) => {
	if (!req.body) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Missing a required param',
		});
	}

	if (!req.body.id) {
		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'Incorrect format',
		});
	}

	const id = req.body.id as string;
});

router.get(`/test/`, async (req, res) => {
	const key = req.headers.authorization || req.query?.key;

	if (key == undefined) {
		return res.json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'Missing token through authorization or query',
			})
		);
	}

	if (key != process.env.OWNER_KEY) {
		return res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'This is an owner only route',
			})
		);
	}

	const request = await client.query(
		`SELECT * FROM ApiUser WHERE apikey = '${key}'`
	);

	if (!request.rows[0]) {
		return res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'Invalid key',
			})
		);
	}

	const index = request.rows[0];

	const data = {
		id: index.id,
		apikey: index.apikey,
	};

	return res.json(data);
});

export default router;
