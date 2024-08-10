export default class Helpers {
	/**
	 * Truncate file name
	 * @param fileName
	 * @param maxLength
	 */
	static truncateFileName = (fileName: string, maxLength: number = 18): string => {
		const extension = fileName.split(".").pop();
		const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf("."));

		if (fileName.length <= maxLength) {
			return fileName;
		}

		const truncatedLength = maxLength - (extension ? extension.length + 1 : 0) - 3;
		const truncatedName = nameWithoutExtension.substring(0, truncatedLength);

		return `${truncatedName}...${extension ? `.${extension}` : ""}`;
	};

	static truncateName(name: string, maxLength: number = 10): string {
		if (name.length <= maxLength) {
			return name;
		}
		return name.substring(0, maxLength - 3) + "...";
	}
}
