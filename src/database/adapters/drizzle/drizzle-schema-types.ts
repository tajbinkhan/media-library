import { InferSelectModel } from "drizzle-orm";

import { media } from "@/database/adapters/drizzle/drizzle-schema";

export type MediaSchemaType = InferSelectModel<typeof media>;
