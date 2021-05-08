import express from 'express';
import Routes from './Routes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.use((req, res, next) => next());

app.use('/', Routes);

app.listen(process.env.PORT, () =>
	console.log(`Running app on ${process.env.PORT}`)
);
