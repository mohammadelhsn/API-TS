import axios from 'axios';
import { Client, UserFlags, Snowflake } from 'discord.js';
import Roblox from 'noblox.js';
import * as dotenv from 'dotenv';
import BaseObj from '../Structures/BaseObj';
import Funcs from '../Interfaces/Funcs';

dotenv.config();
const client = new Client();

namespace Functions {
	export class Utils {
		FormatNumber(x: string | number) {
			if (typeof x !== 'number') parseInt(x);
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
		Capitalize(string: string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
	}
	export class Funcs {
		async Roblox(user: string) {}
		async Discord(user: Snowflake) {}
		async Subreddit(user: string) {}
		async User(user: string) {}
	}
}

export = Functions;
