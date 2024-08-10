export function serverSideFormData(data: FormData) {
	const formDataObject: any = {};

	data.forEach((value, key) => {
		const values = data.getAll(key);

		if (values.length === 1) {
			try {
				formDataObject[key] = JSON.parse(values[0] as string);
			} catch (error) {
				formDataObject[key] = values[0];
			}
		} else {
			formDataObject[key] = values.map(item => {
				try {
					return JSON.parse(item as string);
				} catch (error) {
					return item;
				}
			});
		}
	});

	return formDataObject;
}

type SimpleValue = string | number | boolean | null | undefined;
type ComplexValue = SimpleValue | { [key: string]: ComplexValue } | ComplexValue[];
type ClientFormDataValue = SimpleValue | File | ComplexValue;

export function clientSideFormData(
	data: Record<string, ClientFormDataValue | ClientFormDataValue[] | FileList | File[]>
): FormData {
	const formData = new FormData();

	for (const [key, value] of Object.entries(data)) {
		if (value instanceof FileList) {
			Array.from(value).forEach(file => {
				formData.append(key, file);
			});
		} else if (Array.isArray(value)) {
			formData.append(key, JSON.stringify(value));
		} else if (value instanceof File) {
			formData.append(key, value);
		} else if (typeof value === "object" && value !== null) {
			formData.append(key, JSON.stringify(value));
		} else if (value !== null && value !== undefined) {
			formData.append(key, String(value));
		}
	}

	return formData;
}
