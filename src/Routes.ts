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
		docs: 'https://processversion.herokuapp.com/docs',
		endpoints: `https://processversion.herokuapp.com/endpoints`,
	});
});

router.get('/docs', (req, res) => {
	res.redirect(`https://github.com/ProcessVersion/processversion-api#readme`);
});

router.get('/endpoints', (req, res) => {
	res.json([
		{
			path: '/reddit',
			methods: ['GET'],
			params: [
				{ name: 'user', type: 'string', description: 'Reddit username' },
			],
			status: 'Working',
		},
		{
			path: '/subreddit',
			methods: ['GET'],
			params: [
				{ name: 'subreddit', type: 'string', description: 'Subreddit name' },
			],
			status: 'Working',
		},
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
		{
			path: '/user',
			methods: ['GET', 'PATCH', 'PUT', 'DELETE'],
			params: null,
			status: 'Working',
		},
	]);
});

router.get(`/roblox/`, async (req, res) => {
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

	const request = await client.query(
		`SELECT ips FROM ApiUser WHERE apikey = '${key}'`
	);

	if (request.rows.length == 0 || !request.rows[0]) {
		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = ${key}`
		);
		console.log(`Successfully binded IP`, req.ip);
		await client.query(`COMMIT`);
	}

	if (request.rows.length > 0) {
		const index = request.rows[0];

		console.log("IP address", index);
	}

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
	try {
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
			`SELECT * FROM ApiUser WHERE id = '${req.query.id}'`
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
		};

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: data,
			})
		);
	} catch (error) {
		console.log(error);

		return res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'An unexpected error has occurred',
			})
		);
	}
});

router.post('/user/', async (req, res) => {
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
	try {
		const id = req.body.id;

		const request = await client.query(
			`SELECT * FROM ApiUser WHERE id = '${id}'`
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

		if (!id || !req.body?.key) {
			return res.json(
				new BaseObj({
					success: false,
					status: null,
					statusMessage: 'Incorrect format',
					data: null,
				})
			);
		}

		await client.query(`BEGIN`);

		const testData = await client.query(
			`INSERT INTO ApiUser(id, apikey) VALUES('${id}', '${req.body.key}') RETURNING *`
		);

		await client.query(`COMMIT`);

		const data = {
			id: testData.rows[0].id,
			key: testData.rows[0].apikey,
		};

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: data,
			})
		);
	} catch (error) {
		console.log(error);

		return res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'An unexpected error has occurred',
			})
		);
	}
});

router.patch('/user/', async (req, res) => {
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
	try {
		if (!req.body) {
			return new BaseObj({
				success: false,
				status: null,
				statusMessage: 'Missing a required param',
			});
		}

		if (!req.query.id || !req.body.key) {
			return new BaseObj({
				success: false,
				status: null,
				statusMessage: 'Incorrect format',
			});
		}

		const id = req.query.id;
		const key = req.body.key;

		await client.query(`BEGIN`);

		const request = await client.query(
			`UPDATE ApiUser SET apikey = '${key}' WHERE id = '${id}' RETURNING *`
		);

		await client.query(`COMMIT`);

		const index = request.rows[0];

		const data = {
			id: index.id,
			key: index.apikey,
		};

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: data,
			})
		);
	} catch (error) {
		console.log(error);

		return res.json(
			new BaseObj({
				success: false,
				status: null,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	}
});

router.delete('/user/', async (req, res) => {
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
	try {
		if (!req.body) {
			return new BaseObj({
				success: false,
				status: null,
				statusMessage: 'Missing a required param',
			});
		}

		if (!req.query.id) {
			return new BaseObj({
				success: false,
				status: null,
				statusMessage: 'Incorrect format',
			});
		}

		const id = req.query.id as string;

		await client.query(`BEGIN`);

		await client.query(`DELETE FROM ApiUser WHERE id = '${id}'`);

		await client.query(`COMMIT`);

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: null,
			})
		);
	} catch (error) {
		console.log(error);

		return new BaseObj({
			success: false,
			status: null,
			statusMessage: 'An unexpected error has occurred',
			data: null,
		});
	}
});

export default router;
