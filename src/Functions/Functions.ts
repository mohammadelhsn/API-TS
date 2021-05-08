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

				const { FormatNumber } = new Utils();

				if (id) {
					const info = await Roblox.getPlayerInfo(id);
					if (info.isBanned == true) {
						const data = {
							username: info.username,
							thumbnail: `https://www.roblox.com/bust-thumbnail/image?userId=${id}&width=420&height=420&format=png`,
							bio: info.blurb ? info.blurb : 'N/A',
							joinDate: info.joinDate,
						};
						return new BaseObj({
							success: true,
							status: 200,
							statusMessage: 'OK',
							data: data,
						});
					}
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
		async Discord(user: Snowflake) {
			const flags = {
				DISCORD_EMPLOYEE: `Discord employee`,
				DISCORD_PARTNER: `Discord partner`,
				BUGHUNTER_LEVEL_1: `Level 1 bug hunter`,
				BUGHUNTER_LEVEL_2: `Level 2 bug hunter`,
				HYPESQUAD_EVENTS: `Hypesquad events`,
				HOUSE_BRAVERY: `Hypesquad bravery`,
				HOUSE_BRILLIANCE: `Hypesquad brilliance`,
				HOUSE_BALANCE: `Hypesquad balance`,
				EARLY_SUPPORTER: `Early supporter`,
				TEAM_USER: 'Team User',
				SYSTEM: `System`,
				VERIFIED_BOT: `Bot emoji`,
				VERIFIED_DEVELOPER: `Verified discord bot developer`,
			};

			try {
				const res = await client.users.fetch(user);
				const userflag = new UserFlags(res.flags);
				const userFlag = userflag.toArray();
				const userflags = `${
					userFlag.length ? userFlag.map((f) => flags[f]).join(' ') : null
				}`;

				if (!res)
					return new BaseObj({
						success: true,
						status: 404,
						statusMessage: 'User not found',
						data: null,
					});

				const data = {
					username: res.username,
					id: res.id,
					tag: `${res.username}#${res.discriminator}`,
					system: res.system,
					bot: res.bot,
					discriminator: res.discriminator,
					createdAt: res.createdAt,
					pfp: res.displayAvatarURL({ dynamic: true }),
					flags: userflags,
				};

				return new BaseObj({
					success: true,
					status: 200,
					statusMessage: 'OK',
					data: data,
				});
			} catch (error) {
				if (error?.httpStatus == 400) {
					return new BaseObj({
						success: false,
						status: 400,
						statusMessage: 'Provided query is not a snowflake (ID)',
						data: null,
					});
				}
				if (error?.httpStatus == 404) {
					return new BaseObj({
						success: false,
						status: 404,
						statusMessage: "This user doesn't exist or is banned",
						data: null,
					});
				}

				console.log(error);

				return new BaseObj({
					success: false,
					status: 500,
					statusMessage: 'An unexpected error has occurred',
					data: null,
				});
			}
		}
		async Subreddit(user: string) {
			try {
				const res = await axios.get(
					`https://www.reddit.com/user/${user}/about.json`
				);
				const body = res.data;

				console.log(body);
			} catch (error) {
				console.log(error);
			}
		}
		async User(user: string) {}
	}
}

export = Functions;
