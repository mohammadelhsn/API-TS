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
		async Roblox(user: string) {
			try {
				const id = await Roblox.getIdFromUsername(user);

				const { FormatNumber, Capitalize } = new Utils();

				if (id) {
					const info = await Roblox.getPlayerInfo(id);

					const data = {
						isBanned: info.isBanned,
						username: info.username,
						pastNames: info.oldNames,
						bioL: info.blurb,
						join_date: FormatNumber(info.age),
						friends: info.friendCount,
						following: FormatNumber(info.followingCount),
						followers: FormatNumber(info.followerCount),
						profile_url: `https://roblox.com/users/${id}/profile`,
						thumbnail: `https://www.roblox.com/bust-thumbnail/image?userId=${id}&width=420&height=420&format=png`,
					};
					return new BaseObj({
						success: true,
						status: 200,
						statusMessage: 'OK',
						data: data,
					});
				}
			} catch (error) {
				return new BaseObj({
					success: true,
					status: 500,
					statusMessage: 'An unexpected error has occurred',
					data: null,
				});
			}
		}
		async Discord(user: Snowflake) {}
		async Subreddit(user: string) {}
		async User(user: string) {}
	}
}

export = Functions;
