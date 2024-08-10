type MediaDataType = {
	asset_id: string;
	public_id: string;
	version_id: string;
	signature: string;
	width: number;
	height: number;
	format: string;
	resource_type: string;
	url: string;
	secure_url: string;
	asset_folder: string;
	display_name: string;
	original_filename: string;
	created_at: string;
};

interface Files {
	file: File;
	alt: string;
}

interface MediaData {
	id: number;
	title: string;
	alt: string;
	assetId: string;
	publicId: string;
	versionId: string;
	signature: string;
	width: number;
	height: number;
	format: string;
	resourceType: string;
	url: string;
	secureUrl: string;
	assetFolder: string;
	displayName: string;
	originalFilename: string;
	createdAt: string;
	updatedAt: string;
}
