import { NextRequest, NextResponse } from "next/server";

export abstract class ApiController {
	protected request: NextRequest;
	protected response: NextResponse;

	protected constructor(req: NextRequest, res: NextResponse) {
		this.request = req;
		this.response = res;
	}

	async getReqBody() {
		return await this.request.json();
	}

	async getReqFormData() {
		return await this.request.formData();
	}

	getQueryParam(param: string) {
		const queryParams = this.request.nextUrl.searchParams;
		const getParamsResult = queryParams.get(param);

		return getParamsResult;
	}
}

export interface ApiCrudController {
	index(): any;
	create(): any;
	show(id: number | string): any;
	update(id: number | string): any;
	delete(id: number | string): any;
}
