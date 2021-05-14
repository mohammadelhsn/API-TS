import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';
import { Snowflake } from 'discord.js';

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

router.get('/test/', (req, res) => {
	return res.json({ success: true, link: 'https://youtu.be/dQw4w9WgXcQ' });
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

		return new BaseObj({
			success: true,
			status: 200,
			statusMessage: 'OK',
			data: { text: new Funcs().reverse(req.query.text) },
		});
	} catch (error) {
		console.log(error);
	}
});

export default router;
