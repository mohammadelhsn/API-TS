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
	if (!req.query.id) {
		res.json(
			new BaseObj({
				success: false,
				status: 400,
				statusMessage: 'Missing id query',
				data: null,
			})
		);
	}

	res.json({ success: true, link: 'https://youtu.be/dQw4w9WgXcQ' });
});

router.get(`/roblox/:query`, async (req, res) => {
	const username = req.params.query;

	const { Roblox } = new Funcs();

	res.json(await Roblox(username));
});

router.get('/discord/:query', async (req, res) => {
	const id: Snowflake = req.params.query;

	const { Discord } = new Funcs();

	res.json(await Discord(id));
});

export default router;
