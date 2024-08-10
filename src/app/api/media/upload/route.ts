import { NextRequest, NextResponse } from "next/server";

import { ServiceResponse } from "@/core/service-api";
import MediaController from "@/modules/media/controllers/media-controller";

export const GET = async (request: NextRequest, response: NextResponse) => {
	try {
		return new MediaController(request, response).getMediaFile();
	} catch (error: any) {
		return ServiceResponse.internalServerError();
	}
};

export const POST = async (request: NextRequest, response: NextResponse) => {
	try {
		return new MediaController(request, response).uploadFile();
	} catch (error: any) {
		return ServiceResponse.internalServerError();
	}
};

export const DELETE = async (request: NextRequest, response: NextResponse) => {
	try {
		return new MediaController(request, response).deleteFile();
	} catch (error: any) {
		return ServiceResponse.internalServerError();
	}
};
