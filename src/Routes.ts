import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';
import { Snowflake } from 'discord.js';

const router = Router();

const { Utils, Funcs } = Functions;

router.use((req, res, next) => next());

router.get('/', (req, res) => {
	res.sendStatus(200);
});

router.get('/test', (req, res) => {
	res.json({ test: true, data: { link: 'https://youtu.be/dQw4w9WgXcQ' } });
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
