import { useCallback, useEffect, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

import { FormValues } from "@/modules/media/validators/media.schema";

interface FileWithPreview extends File {
	preview: string;
}

interface FileWithAlt {
	file: FileWithPreview;
	alt: string;
}

interface UseFileUploadOptions {
	acceptedFileTypes: Accept;
	maxFileSize?: number;
	setValue: UseFormSetValue<FormValues>;
}

export const useFileUpload = ({
	acceptedFileTypes,
	maxFileSize,
	setValue
}: UseFileUploadOptions) => {
	const [files, setFiles] = useState<FileWithAlt[]>([]);
	const [rejected, setRejected] = useState<FileRejection[]>([]);

	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			if (acceptedFiles?.length) {
				const existingFileNames = files.map(file => file.file.name);
				if (existingFileNames.includes(acceptedFiles[0].name)) {
					toast.warning("File with this name already in upload list");
					return null;
				}
				const newFiles = acceptedFiles.map(file => ({
					file: Object.assign(file, { preview: URL.createObjectURL(file) }),
					alt: ""
				}));
				setFiles(previousFiles => [...previousFiles, ...newFiles]);
				setValue("files", [...files, ...newFiles], { shouldValidate: true });
			}

			if (rejectedFiles?.length) {
				const existingFileNames = rejected.map(file => file.file.name);
				if (existingFileNames.includes(rejectedFiles[0].file.name)) {
					toast.warning("File with this name already in rejected list");
					return null;
				}
				setRejected(previousFiles => [...previousFiles, ...rejectedFiles]);
			}
		},
		[files, setValue, rejected]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: acceptedFileTypes,
		maxSize: maxFileSize,
		onDrop
	});

	useEffect(() => {
		return () => files.forEach(fileWithAlt => URL.revokeObjectURL(fileWithAlt.file.preview));
	}, [files]);

	const removeFile = (name: string) => {
		setFiles(prevFiles => {
			const updatedFiles = prevFiles.filter(fileWithAlt => fileWithAlt.file.name !== name);
			setValue("files", updatedFiles, { shouldValidate: true });
			return updatedFiles;
		});
	};

	const removeAll = () => {
		setFiles([]);
		setRejected([]);
		setValue("files", [], { shouldValidate: true });
	};

	const removeRejected = (name: string) => {
		setRejected(files => files.filter(({ file }) => file.name !== name));
	};

	const updateAlt = (fileName: string, altText: string) => {
		setFiles(prevFiles => {
			const updatedFiles = prevFiles.map(fileWithAlt =>
				fileWithAlt.file.name === fileName ? { ...fileWithAlt, alt: altText } : fileWithAlt
			);
			setValue("files", updatedFiles, { shouldValidate: true });
			return updatedFiles;
		});
	};

	return {
		files,
		rejected,
		getRootProps,
		getInputProps,
		isDragActive,
		removeFile,
		removeAll,
		removeRejected,
		updateAlt
	};
};
