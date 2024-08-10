import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const media = pgTable("media", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	alt: text("alt").notNull(),
	assetId: text("asset_id").notNull(),
	publicId: text("public_id").notNull(),
	versionId: text("version_id").notNull(),
	signature: text("signature").notNull(),
	width: integer("width").notNull(),
	height: integer("height").notNull(),
	format: text("format").notNull(),
	resourceType: text("resource_type").notNull(),
	url: text("url").notNull(),
	secureUrl: text("secure_url").notNull(),
	assetFolder: text("asset_folder").notNull(),
	displayName: text("display_name").notNull(),
	originalFilename: text("original_filename").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});
