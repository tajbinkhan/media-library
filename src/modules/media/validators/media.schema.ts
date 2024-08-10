import { z } from "zod";

export const formSchema = z.object({
	files: z.array(
		z.object({
			file: z.instanceof(File),
			alt: z.string().optional()
		})
	)
});

export const mediaSchema = z.array(
	z.object({
		id: z.number(),
		title: z.string(),
		alt: z.string(),
		assetId: z.string().uuid(),
		publicId: z.string(),
		versionId: z.string(),
		signature: z.string(),
		width: z.number().positive(),
		height: z.number().positive(),
		format: z.string(),
		resourceType: z.string(),
		url: z.string().url(),
		secureUrl: z.string().url(),
		assetFolder: z.string(),
		displayName: z.string(),
		originalFilename: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime()
	})
);

export const validateMedia = (errorMessage: string = "Please select at least one media") => {
	return mediaSchema.min(1, errorMessage);
};

export type ValidateMediaType = z.infer<typeof mediaSchema>;

export type FormValues = z.infer<typeof formSchema>;
