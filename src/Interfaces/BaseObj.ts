namespace Obj {
	export interface Opts {
		success: boolean;
		status: number | null;
		statusMessage: string | null;
		data?: object | null;
	}
}

export = Obj;
