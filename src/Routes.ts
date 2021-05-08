import { Router } from 'express';
import BaseObj from './Structures/BaseObj';
import Functions from './Functions/Functions';

const router = Router();

const { Utils, Funcs } = Functions;

router.use((req, res, next) => next());

router.get('/', (req, res) => {
	res.sendStatus(200);
});

router.get('/test', (req, res) => {
	res.json({ test: true, data: { hi: 'Hi!' } });
});

export default router;
