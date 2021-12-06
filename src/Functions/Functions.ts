import axios from 'axios';
import { Client, UserFlags, Snowflake } from 'discord.js';
import Roblox from 'noblox.js';
import * as dotenv from 'dotenv';
import BaseObj from '../Structures/BaseObj';
import Funcs from '../Interfaces/Funcs';
import moment from 'moment';
import crypto from 'crypto';

dotenv.config();

const client = new Client();

namespace Functions {
	export class Utils {
		protected secret = process.env.SECRET_KEY;
		FormatNumber(x: string | number) {
			if (typeof x !== 'number') parseInt(x);
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}
		Capitalize(string: string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		ConvertKey = (key: string) =>
			crypto
				.createHmac('sha256', this.secret)
				.update(key)
				.digest()
				.toString('hex');
		ConvertIP = (ip: string) =>
			crypto
				.createHmac('sha256', this.secret)
				.update(ip)
				.digest()
				.toString('hex');
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
							isBanned: info.isBanned,
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
						bio: info.blurb,
						age: FormatNumber(info.age),
						joinDate: info.joinDate,
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
					`https://www.reddit.com/r/${user}/about.json`
				);
				const body = <Funcs.Subreddit>res.data.data;

				const { Capitalize, FormatNumber } = new Utils();

				const data = {
					url: `https://www.reddit.com${body.url}`,
					name_prefix: body.display_name_prefixed,
					name: body.display_name,
					title: body.title,
					description: body.public_description,
					created: moment
						.unix(body.created)
						.format('dddd, MMMM Do YYYY, h:mm:ss a'),
					type: Capitalize(body.subreddit_type),
					over18: body.over18,
					quarantined: body.quarantine,
					lang: Capitalize(body.lang),
					members: {
						online: FormatNumber(body.accounts_active),
						subscribers: FormatNumber(body.subscribers),
					},
					colors: {
						primary_color: body.primary_color,
						key_color: body.key_color,
					},
					images: {
						header_img: body.header_img.replace(/(amp;)/gi, ''),
						community_icon: body.community_icon.replace(/(amp;)/gi, ''),
						background_img: body.banner_background_image.replace(
							/(amp;)/gi,
							''
						),
					},
				};

				return new BaseObj({
					success: true,
					status: 200,
					statusMessage: 'OK',
					data: data,
				});
			} catch (error) {
				if (error?.response?.status == 404) {
					return new BaseObj({
						success: false,
						status: 404,
						statusMessage: 'Subreddit not found',
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
		async User(user: string) {
			try {
				const res = await axios.get(
					`https://www.reddit.com/user/${user}/about.json`
				);
				const body = <Funcs.User>res.data;

				if (body.data.hide_from_robots == true) {
					return new BaseObj({
						success: true,
						status: 200,
						statusMessage: 'OK',
						data: { hideden: true },
					});
				}

				const { Capitalize, FormatNumber } = new Utils();

				const data = {
					url: `https://reddit.com${body.data.subreddit.url}`,
					name: body.data.name,
					name_prefixed: body.data.subreddit.display_name_prefixed,
					id: body.data.id,
					pfp: body.data.icon_img.replace(/(amp;)/gi, ''),
					verified: body.data.verified,
					created: moment
						.unix(body.data.created)
						.format('dddd, MMMM Do YYYY, h:mm:ss a'),
					total_karma: FormatNumber(body.data.total_karma),
					link_karma: FormatNumber(body.data.link_karma),
					awarder_karma: body.data.awarder_karma,
					awardee_karma: body.data.awardee_karma,
					mod: body.data.is_mod,
					gold: body.data.is_gold,
					employee: body.data.is_employee,
				};

				return new BaseObj({
					success: true,
					status: 200,
					statusMessage: 'OK',
					data: data,
				});
			} catch (error) {
				if (error?.response?.status == 404) {
					return new BaseObj({
						success: false,
						status: 404,
						statusMessage: "I couldn't find this user!",
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
		reverse(s) {
			return [...s].reverse().join('');
		}
	}
	export class Verifier {
		secret = process.env.SECRET_KEY;
		key: string;
		ip: string;
		constructor(key: string, ip: string, convert = false) {
			this.key = key;
			this.ip = ip;

			if (convert == true) {
				this.HideKey();
				this.HideIP();
			}
		}
		HideKey(key?: string) {
			if (key)
				return crypto
					.createHmac('sha256', this.secret)
					.update(key)
					.digest()
					.toString('hex');

			this.key = crypto
				.createHmac('sha256', this.secret)
				.update(this.key)
				.digest()
				.toString('hex');

			return this;
		}
		HideIP(ip?: string) {
			if (ip)
				return crypto
					.createHmac('sha256', this.secret)
					.update(ip)
					.digest()
					.toString('hex');

			this.ip = crypto
				.createHmac('sha256', this.secret)
				.update(this.ip)
				.digest()
				.toString('hex');

			return this;
		}
		CheckKey = (compare: string, convert = true) =>
			convert == false
				? compare == this.key
				: this.key == this.HideKey(compare);
		CheckIP = (compare: string, convert = true) =>
			convert == false ? compare == this.ip : this.ip == this.HideIP(compare);
	}
}

export = Functions;
