import { Router } from 'express';
import BaseObj from './Structures/BaseObj';

const router = Router();

router.use((req, res, next) => next());

router.get('/', (req, res) => {
	res.send(200);
});

//router.get('/insta', (req, res) => res.json({ lol: 'Hello there :)' }));

export default router;
