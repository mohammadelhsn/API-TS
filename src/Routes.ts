import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';

const Client = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const router = Router();

const { Funcs } = Functions;

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
		},
		{
			path: '/subreddit',
			methods: ['GET'],
		},
		{
			path: '/roblox',
			methods: ['GET'],
		},
		{
			path: '/discord',
			methods: ['GET'],
		},
		{
			path: '/user',
			methods: ['GET', 'PATCH', 'PUT', 'DELETE'],
		},
	]);
});

router.get(`/roblox/`, async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;
	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Missing token through authorization or query',
					data: null,
				})
			);
		}

		const request = await client.query(
			`SELECT ips FROM ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Provided key is invalid',
					data: null,
				})
			);
		}

		if (request.rows[0].ips == null || request.rows[0].ips == 'null') {
			await client.query(`BEGIN`);
			await client.query(
				`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = '${key}'`
			);
			console.log(`Successfully binded IP`);
			await client.query(`COMMIT`);
		}

		const ip = request.rows[0].ips == null ? req.ip : request.rows[0].ips;

		if (req.ip != ip) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage:
						'Invalid IP address. Token is bound to the first IP address you used',
					data: null,
				})
			);
		}

		if (!req.query.username) {
			return res.status(400).json(
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
	} catch (error) {
		console.log(error);

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		const result = await client.query(
			`SELECT timesused FROM ApiUser WHERE apikey = '${key}'`
		);

		if (result.rows.length == 0) {
			return client.release();
		}

		let times = parseInt(result.rows[0].timesused);
		times++;

		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET timesused = '${times}' WHERE apikey = '${key}'`
		);
		await client.query(`COMMIT`);

		client.release();
	}
});

const apiLimiter = rateLimit({
	max: 75,
	handler: function (req, res) {
		return res.status(429).json(
			new BaseObj({
				success: false,
				status: 429,
				statusMessage: 'Too many requests, slow down!',
				data: null,
			})
		);
	},
});

router.get('/discord/', apiLimiter, async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;
	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'You must provide an API key',
					data: null,
				})
			);
		}

		const request = await client.query(
			`SELECT ips from ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'Invalid API key',
					data: null,
				})
			);
		}

		if (request.rows[0].ips == null || request.rows[0].ips == 'null') {
			await client.query(`BEGIN`);
			await client.query(
				`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = '${key}`
			);
			await client.query(`COMMIT`);
		}

		const ip = request.rows[0].ips == null ? req.ip : request.rows[0].ips;

		if (ip != request.rows[0].ips) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage:
						'Invalid IP address. API key must be used at original IP address',
					data: null,
				})
			);
		}

		if (!req.query.id) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Missing id query',
					data: null,
				})
			);
		}

		const id = req.query.id as string;

		const { Discord } = new Funcs();

		return res.json(await Discord(id));
	} catch (error) {
		console.log(error);

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		const result = await client.query(
			`SELECT timesused FROM ApiUser WHERE apikey = '${key}'`
		);

		if (result.rows.length == 0) {
			return client.release();
		}

		let times = parseInt(result.rows[0].timesused);
		times++;

		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET timesused = '${times}' WHERE apikey = '${key}'`
		);
		await client.query(`COMMIT`);

		client.release();
	}
});

router.get('/subreddit/', async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;
	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'You must provide a key',
					data: null,
				})
			);
		}

		const request = await client.query(
			`SELECT ips FROM ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'Invalid API key provided',
					data: null,
				})
			);
		}

		if (request.rows[0].ips == null) {
			await client.query(`BEGIN`);
			await client.query(
				`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = '${key}'`
			);
			await client.query(`COMMIT`);
		}

		const ip = request.rows[0].ips == null ? req.ip : request.rows[0].ips;

		if (ip != req.ip) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'Invalid IP address.',
					data: null,
				})
			);
		}

		if (!req.query.subreddit) {
			return res.status(400).json(
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
	} catch (error) {
		console.log(error);

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occured',
				data: null,
			})
		);
	} finally {
		const result = await client.query(
			`SELECT timesused FROM ApiUser WHERE apikey = '${key}'`
		);

		if (result.rows.length == 0) {
			return client.release();
		}

		let times = parseInt(result.rows[0].timesused);
		times++;

		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET timesused = '${times}' WHERE apikey = '${key}'`
		);
		await client.query(`COMMIT`);

		client.release();
	}
});

router.get('/reddit/', async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;

	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'You must include an API key',
					data: null,
				})
			);
		}

		const request = await client.query(
			`SELECT ips from ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'Invalid API key',
					data: null,
				})
			);
		}

		if (request.rows[0].ips == null || request.rows[0].ips == 'null') {
			await client.query(`BEGIN`);
			await client.query(
				`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = '${key}`
			);
			await client.query(`COMMIT`);
		}

		const ip = request.rows[0].ips == null ? req.ip : request.rows[0].ips;

		if (ip != request.rows[0].ips) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage:
						'Invalid IP address. API key must be used at original IP address',
					data: null,
				})
			);
		}

		if (!req.query.user) {
			return res.status(400).json(
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
	} catch (error) {
		console.log(error);

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occured',
				data: null,
			})
		);
	} finally {
		const result = await client.query(
			`SELECT timesused FROM ApiUser WHERE apikey = '${key}'`
		);

		if (result.rows.length == 0) {
			return client.release();
		}

		let times = parseInt(result.rows[0].timesused);
		times++;

		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET timesused = '${times}' WHERE apikey = '${key}'`
		);
		await client.query(`COMMIT`);

		client.release();
	}
});

router.get('/reverse/', async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;

	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'You must include an API key',
					data: null,
				})
			);
		}

		const request = await client.query(
			`SELECT ips from ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'Invalid API key',
					data: null,
				})
			);
		}

		if (request.rows[0].ips == null || request.rows[0].ips == 'null') {
			await client.query(`BEGIN`);
			await client.query(
				`UPDATE ApiUser SET ips = '${req.ip}' WHERE apikey = '${key}`
			);
			await client.query(`COMMIT`);
		}

		const ip = request.rows[0].ips == null ? req.ip : request.rows[0].ips;

		if (ip != request.rows[0].ips) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage:
						'Invalid IP address. API key must be used at original IP address',
					data: null,
				})
			);
		}

		if (!req.query.text) {
			return res.status(400).json(
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

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		const result = await client.query(
			`SELECT timesused FROM ApiUser WHERE apikey = '${key}'`
		);

		if (result.rows.length == 0) {
			return client.release();
		}

		let times = parseInt(result.rows[0].timesused);
		times++;

		await client.query(`BEGIN`);
		await client.query(
			`UPDATE ApiUser SET timesused = '${times}' WHERE apikey = '${key}'`
		);
		await client.query(`COMMIT`);

		client.release();
	}
});

router.get('/user/', async (req, res) => {
	const key = req.headers.authorization || req.query?.key;
	const client = await Client.connect();
	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Missing token through authorization or query',
					data: null,
				})
			);
		}

		if (key != process.env.OWNER_KEY) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'This is an owner only route',
					data: null,
				})
			);
		}
		if (!req.query.id) {
			return res.status(400).json(
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
			return res.status(404).json(
				new BaseObj({
					success: false,
					status: 404,
					statusMessage: "This user doesn't exist in the database",
					data: null,
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

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		client.release();
	}
});

router.post('/user/', async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;

	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Missing token through authorization or query',
					data: null,
				})
			);
		}

		if (key != process.env.OWNER_KEY) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'This is an owner only route',
					data: null,
				})
			);
		}

		const id = req.body.id;

		const request = await client.query(
			`SELECT * FROM ApiUser WHERE id = '${id}'`
		);

		if (request.rows.length != 0 || request.rows[0]?.id) {
			return res.status(409).json(
				new BaseObj({
					success: false,
					status: 409,
					statusMessage: 'This user already exists in the database!',
					data: null,
				})
			);
		}

		if (!id || !req.body?.key) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Incorrect format',
					data: null,
				})
			);
		}

		await client.query(`BEGIN`);
		const user = await client.query(
			`INSERT INTO ApiUser(id, apikey) VALUES('${id}', '${req.body.key}') RETURNING *`
		);
		await client.query(`COMMIT`);

		const data = {
			id: user.rows[0].id,
			key: user.rows[0].apikey,
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

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		client.release();
	}
});

router.patch('/user/', async (req, res) => {
	const client = await Client.connect();
	const apikey = req.headers.authorization || req.query?.key;

	try {
		if (apikey == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Missing token through authorization or query',
					data: null,
				})
			);
		}

		if (apikey != process.env.OWNER_KEY) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'This is an owner only route',
					data: null,
				})
			);
		}
		if (!req.body) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Missing a required param',
					data: null,
				})
			);
		}

		if (!req.query.id || !req.body.key) {
			return res.status(409).json(
				new BaseObj({
					success: false,
					status: 409,
					statusMessage: 'Incorrect format',
					data: null,
				})
			);
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
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				data: null,
			})
		);
	} finally {
		client.release();
	}
});

router.delete('/user/', async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization || req.query?.key;

	try {
		if (key == undefined) {
			return res.status(401).json(
				new BaseObj({
					success: false,
					status: 401,
					statusMessage: 'Missing token through authorization or query',
					data: null,
				})
			);
		}

		if (key != process.env.OWNER_KEY) {
			return res.status(403).json(
				new BaseObj({
					success: false,
					status: 403,
					statusMessage: 'This is an owner only route',
					data: null,
				})
			);
		}

		if (!req.body) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Missing a required param',
					data: null,
				})
			);
		}

		if (!req.query.id) {
			return res.status(400).json(
				new BaseObj({
					success: false,
					status: 400,
					statusMessage: 'Incorrect format',
					data: null,
				})
			);
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

		return res.status(500).json(
			new BaseObj({
				status: 500,
				statusMessage: 'An unexpected error has occurred',
				success: false,
				data: null,
			})
		);
	} finally {
		client.release();
	}
});

router.get(`/keys/`, async (req, res) => {
	const client = await Client.connect();
	const key = req.headers.authorization;

	if (key == undefined) {
		return res.status(401).json(
			new BaseObj({
				success: false,
				status: 401,
				statusMessage: 'Missing token through authorization or query',
				data: null,
			})
		);
	}

	if (key != process.env.OWNER_KEY) {
		return res.status(403).json(
			new BaseObj({
				success: false,
				status: 403,
				statusMessage: 'This is an owner only route',
				data: null,
			})
		);
	}

	if (!req.query.key) {
		return res.status(400).json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Incorrect format',
				data: null,
			})
		);
	}

	try {
		const request = await client.query(
			`SELECT apikey from ApiUser WHERE apikey = '${key}'`
		);

		if (request.rows.length == 0) {
			return res.json(
				new BaseObj({
					success: true,
					status: 200,
					statusMessage: 'OK',
					data: null,
				})
			);
		}

		return res.json(
			new BaseObj({
				success: true,
				status: 200,
				statusMessage: 'OK',
				data: { apikey: request.rows[0].apikey },
			})
		);
	} catch (error) {
		console.log(error);

		return res.status(500).json(
			new BaseObj({
				success: false,
				status: 500,
				statusMessage: 'An unexpected error has occurred',
			})
		);
	} finally {
		client.release();
	}
});

export default router;
