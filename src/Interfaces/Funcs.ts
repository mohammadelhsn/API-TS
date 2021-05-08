namespace Funcs {
	export type IGProfile = {
		logging_page_id: string;
		show_suggested_profiles: boolean;
		show_follow_dialog: boolean;
		graphql: {
			user: {
				biography: string;
				blocked_by_viewer: boolean;
				restricted_by_viewer: boolean;
				country_block: boolean;
				external_url: string;
				external_url_linkshmmied: string;
				edge_followed_by: {
					count: number;
				};
				fbid: string;
				followed_by_viewer: boolean;
				edge_follow: {
					count: number;
				};
				follows_viewer: boolean;
				full_name: string;
				id: string;
				is_private: boolean;
				is_verified: boolean;
				profile_pic_url: string;
				profile_pic_url_hd: string;
				username: string;
				edge_owner_to_timeline_media: {
					count: number;
				};
			};
		};
	};
}

export = Funcs;
