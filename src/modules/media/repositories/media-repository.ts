import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";

import { ServiceResponse, status } from "@/core/service-api";
import DrizzleBaseRepository from "@/database/adapters/drizzle/drizzle-repository";
import { media } from "@/database/adapters/drizzle/drizzle-schema";

interface UploadApiResponseWithAlt extends UploadApiResponse {
	alt: string;
}

interface MediaDataTypeWithAlt extends MediaDataType {
	alt: string;
}

export default class MediaRepository extends DrizzleBaseRepository {
	constructor() {
		super();
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET
		});
	}

	private managedData(data: UploadApiResponseWithAlt): MediaDataTypeWithAlt {
		return {
			asset_id: data.asset_id,
			public_id: data.public_id,
			version_id: data.version_id,
			signature: data.signature,
			width: data.width,
			height: data.height,
			format: data.format,
			resource_type: data.resource_type,
			created_at: data.created_at,
			url: data.url,
			secure_url: data.secure_url,
			asset_folder: data.asset_folder,
			display_name: data.original_filename,
			original_filename: data.original_filename,
			alt: data.alt
		};
	}

	private manageServerData(data: MediaDataTypeWithAlt) {
		return {
			title: data.public_id.split("/")[1],
			alt: data.alt,
			assetId: data.asset_id,
			publicId: data.public_id,
			versionId: data.version_id,
			signature: data.signature,
			width: data.width,
			height: data.height,
			format: data.format,
			resourceType: data.resource_type,
			url: data.url,
			secureUrl: data.secure_url,
			assetFolder: data.asset_folder,
			displayName: data.display_name,
			originalFilename: data.original_filename
		};
	}

	private async saveToDatabase(data: MediaDataTypeWithAlt | MediaDataTypeWithAlt[]) {
		try {
			if (Array.isArray(data)) {
				const extendedData = data.map(item => {
					return this.manageServerData(item);
				});

				const saveData = await this.db.insert(media).values(extendedData).returning();

				return Promise.resolve(saveData);
			} else {
				const extendedData = this.manageServerData(data);

				const saveData = await this.db.insert(media).values(extendedData).returning();

				return Promise.resolve(saveData);
			}
		} catch (error) {
			return ServiceResponse.rejectResponse(error);
		}
	}

	private async uploadSingleImage(
		folderName: string,
		imageUpload: Files
	): Promise<UploadApiResponseWithAlt> {
		const arrayBuffer = await imageUpload.file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		return new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
						folder: folderName
					},
					(
						error: UploadApiErrorResponse | undefined,
						result: UploadApiResponse | undefined
					) => {
						if (error) {
							return reject(error);
						}
						if (result) {
							const resultWithAlt = {
								...result,
								alt: imageUpload.alt
							};
							return resolve(resultWithAlt);
						} else {
							return reject(new Error("Upload failed: No result returned"));
						}
					}
				)
				.end(buffer);
		});
	}

	private async deleteUploadedImage(public_id: string) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await cloudinary.uploader.destroy(public_id);

				return resolve(result);
			} catch (error: any) {
				reject(new Error(error.message));
			}
		});
	}

	public async uploadImage(
		folderName: string,
		imageUploads: Files[]
	): Promise<MediaDataTypeWithAlt[]> {
		const uploadPromises = imageUploads.map(async file => {
			const response = await this.uploadSingleImage(folderName, file);
			return this.managedData(response);
		});
		return Promise.all(uploadPromises);
	}

	public async uploadFile(files: Files[]) {
		try {
			const uploadedFile = await this.uploadImage("Testing", files);

			await this.saveToDatabase(uploadedFile);

			return Promise.resolve(
				ServiceResponse.createResponse(
					"File uploaded successfully",
					status.HTTP_201_CREATED
				)
			);
		} catch (error) {
			return ServiceResponse.rejectResponse(error);
		}
	}

	public async getFiles() {
		try {
			const getData = await this.db.query.media.findMany();

			return Promise.resolve(
				ServiceResponse.createResponse(
					"All Media Files Retrieved",
					status.HTTP_200_OK,
					getData
				)
			);
		} catch (error) {
			return ServiceResponse.rejectResponse(error);
		}
	}

	public async deleteFile(id: number) {
		try {
			const deletedData = await this.db.delete(media).where(eq(media.id, id)).returning();

			this.deleteUploadedImage(deletedData[0].publicId);

			return Promise.resolve(
				ServiceResponse.createResponse("Media Deleted Successfully", status.HTTP_200_OK)
			);
		} catch (error) {
			return ServiceResponse.rejectResponse(error);
		}
	}
}
