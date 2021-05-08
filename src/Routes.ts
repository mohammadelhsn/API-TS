import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';

const router = Router();

const { Utils, Funcs } = Functions;

router.use((req, res, next) => next());

router.get('/', (req, res) => {
	res.sendStatus(200);
});

router.get('/insta/:query', async (req, res) => {
	const username: string = req.params.query;

	const { Instagram } = new Funcs();

	const response = await Instagram(username);
	return res.json(response);
});

export default router;
