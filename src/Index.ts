import express from 'express';
import Routes from './Routes';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use((req, res, next) => next());

app.use('/', Routes);

app.listen(port, () => console.log(`Running app on ${port}`));
