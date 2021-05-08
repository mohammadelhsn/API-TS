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
		async Instagram(user: string) {
			const url = `https://www.instagram.com/${user}/?__a=1`;

			try {
				const res = await axios.get(url);
				const body = <Funcs.IGProfile>res.data;

				const count = Object.keys(body).length;

				if (count == 0) {
					return new BaseObj({
						success: false,
						status: 404,
						statusMessage: "Couldn't find anyone with that username",
						data: null,
					});
				}

				const data = {
					url: `https://www.instagram.com/${body.graphql.user.username}/`,
					user: {
						thumbnail: body.graphql.user.profile_pic_url_hd,
						full_name: body.graphql.user.full_name,
						bio: body.graphql.user.biography,
						username: body.graphql.user.username,
						id: body.graphql.user.id,
					},
					account: {
						followers: body.graphql.user.edge_followed_by.count,
						following: body.graphql.user.edge_follow.count,
						posts: body.graphql.user.edge_owner_to_timeline_media.count,
						private: body.graphql.user.is_private ? true : false,
						verified: body.graphql.user.is_verified ? true : false,
					},
				};

				return new BaseObj({
					success: true,
					status: res.status,
					statusMessage: res.statusText,
					data: data,
				});
			} catch (error) {
				if (error.response.status == 404) {
					return new BaseObj({
						success: false,
						status: error?.response?.status,
						statusMessage: error?.response?.statusText,
						data: null,
					});
				}

				console.log(error);

				return new BaseObj({
					success: false,
					status: error?.response?.status,
					statusMessage: error?.response?.statusText,
					data: null,
				});
			}
		}
		async Roblox(user: string) {}
		async Discord(user: Snowflake) {}
		async Subreddit(user: string) {}
		async User(user: string) {}
	}
}

export = Functions;
