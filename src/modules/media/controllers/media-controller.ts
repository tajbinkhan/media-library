import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ApiController } from "@/core/api-controller";
import { serverSideFormData } from "@/core/form-data";
import { ServiceResponse } from "@/core/service-api";
import MediaRepository from "@/modules/media/repositories/media-repository";

const MediaSchema = z.record(z.string(), z.union([z.string().optional(), z.instanceof(File)]));

type MediaSchemaType = z.infer<typeof MediaSchema>;

export default class MediaController extends ApiController {
	protected mediaRepository: MediaRepository;
	/**
	 * Constructor Initializes the MediaController
	 */
	constructor(request: NextRequest, response: NextResponse) {
		super(request, response);
		this.mediaRepository = new MediaRepository();
	}

	async getMediaFile() {
		try {
			const response = await this.mediaRepository.getFiles();

			return ServiceResponse.sendResponse(response);
		} catch (error: any) {
			return ServiceResponse.sendResponse(error);
		}
	}

	async uploadFile() {
		try {
			const body = await this.getReqFormData();
			const formData = serverSideFormData(body);
			const check = MediaSchema.safeParse(formData);
			if (!check.success)
				return ServiceResponse.badResponse(
					check.error.errors.map(e => e.message).join("\n")
				);

			let files: Files[] = [];

			Object.keys(check.data!).forEach((key, index) => {
				const fileAlt = check.data![`alt_${index}`] as string;
				const file = check.data![`file_${index}`] as File;
				if (file !== undefined && fileAlt !== undefined) {
					const nameParts = file.name.split(".");
					nameParts.pop();
					const fileName = nameParts.join(".");
					const alt = fileAlt !== "" ? fileAlt : fileName;
					const fileObj = { file, alt };
					files.push(fileObj);
				}
			});

			const response = await this.mediaRepository.uploadFile(files);

			return ServiceResponse.sendResponse(response);
		} catch (error: any) {
			return ServiceResponse.sendResponse(error);
		}
	}

	async deleteFile() {
		try {
			const data = await this.getReqBody();

			if (!data.id) return ServiceResponse.badResponse("Id is required");

			const response = await this.mediaRepository.deleteFile(data.id);

			return ServiceResponse.sendResponse(response);
		} catch (error: any) {
			return ServiceResponse.sendResponse(error);
		}
	}
}
