import { z } from "zod";

const emailServerSchema = z.object({
	EMAIL_SERVER_HOST: z.string().min(1),
	EMAIL_SERVER_USER: z.string().min(1),
	EMAIL_SERVER_PASSWORD: z.string().min(1),
	EMAIL_SERVER_PORT: z.string().min(1),
	EMAIL_FROM: z.string().optional()
});

const cloudinarySchema = z.object({
	CLOUDINARY_CLOUD_NAME: z.string().min(1),
	CLOUDINARY_API_KEY: z.string().min(1),
	CLOUDINARY_API_SECRET: z.string().min(1)
});

const envSchema = z.object({
	...emailServerSchema.shape,
	DATABASE_URL: z.string().min(1),
	AUTH_SECRET: z.string().min(1),
	NEXT_PUBLIC_FRONTEND_URL: z.string().min(1),
	NEXT_PUBLIC_BACKEND_API_URL: z.string().min(1),
	CALLBACK_URL_COOKIE_NAME: z.string().min(1),
	...cloudinarySchema.shape
});

const Env = envSchema.safeParse(process.env);

if (!Env.success) {
	throw new Error(Env.error.errors[0].message);
} else {
	console.log("/*** Env loaded successfully ***/");
}

type EnvType = z.infer<typeof envSchema>;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvType {}
	}
}
