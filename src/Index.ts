import express from 'express';
import Routes from './Routes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', true);

app.use((req, res, next) => next());

app.use('/', Routes);

app.listen(process.env.PORT || 3000, () => {
	console.log(`Running app on #3000`);
});
