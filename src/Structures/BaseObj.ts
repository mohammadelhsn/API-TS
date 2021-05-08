import Types from '../Interfaces/BaseObj';

export default class BaseObj {
	success: boolean;
	status: number | null;
	statusMessage: string | null;
	data: object;
	constructor(opts: Types.Opts) {
		this.success = opts.success;
		this.status = opts.status;
		this.statusMessage = opts.statusMessage;
		this.data = opts.data;
	}
}
