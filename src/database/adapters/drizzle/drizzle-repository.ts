import db from "@/database/adapters/drizzle/drizzle-db-config";

export default abstract class DrizzleBaseRepository {
	protected db: typeof db;

	constructor() {
		this.db = db;
	}
}
