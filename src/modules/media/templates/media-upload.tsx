"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Accept } from "react-dropzone";
import { useForm } from "react-hook-form";
import { HiArrowUpTray, HiMiniXMark } from "react-icons/hi2";

import axiosApi from "@/lib/axios-config";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import Helpers from "@/modules/media/helpers/helpers";
import { useFileUpload } from "@/modules/media/hooks/useFileUpload";
import { FormValues, formSchema } from "@/modules/media/validators/media.schema";
import { apiRoute } from "@/routes/routes";

interface MediaUploadProps {
	acceptedFileTypes: Accept;
	maxFileSize?: number;
	refresh?: () => void;
	isScrollable?: boolean;
}

const statusMessages = {
	uploading: "Uploading ...",
	uploaded: "Uploaded successfully",
	error: "Error uploading file"
};

const MediaUpload: React.FC<MediaUploadProps> = ({
	acceptedFileTypes,
	maxFileSize,
	refresh,
	isScrollable = false
}) => {
	const [startUploading, setStartUploading] = useState(false);
	const [isMessageVisible, setIsMessageVisible] = useState(false);
	const [message, setMessage] = useState(statusMessages.uploading);

	const [isPending, startTransition] = useTransition();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			files: []
		}
	});

	const {
		files,
		rejected,
		getRootProps,
		getInputProps,
		isDragActive,
		removeFile,
		removeAll,
		removeRejected
	} = useFileUpload({
		acceptedFileTypes,
		maxFileSize,
		setValue: form.setValue
	});

	useEffect(() => {
		if (startUploading && message === statusMessages.uploaded) {
			setIsMessageVisible(true);
			const timer = setTimeout(() => {
				setIsMessageVisible(false);
				setTimeout(() => {
					setStartUploading(false);
					setMessage(statusMessages.uploading);
				}, 300);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [message, startUploading]);

	const handleSubmit = async (data: FormValues) => {
		if (!data.files?.length) return;
		setStartUploading(true);
		setMessage(statusMessages.uploading);
		setIsMessageVisible(true);

		const formData = new FormData();
		data.files.forEach(({ file, alt }, index) => {
			formData.append(`file_${index}`, file);
			formData.append(`alt_${index}`, alt || "");
		});

		startTransition(async () => {
			await axiosApi
				.post(apiRoute.private.media, formData)
				.then(() => {
					removeAll();
					refresh && refresh();
					setMessage(statusMessages.uploaded);
				})
				.catch(error => {
					console.error(error);
					setMessage(statusMessages.error);
				});
		});
	};

	return (
		<>
			<div
				{...getRootProps()}
				className={cn(
					"relative block bg-gray-50 hover:bg-gray-200 w-full rounded-lg border-2 border-dashed border-gray-400 p-12 text-center hover:border-gray-600 focus:outline-none transition-all cursor-pointer",
					isDragActive && "bg-gray-200"
				)}
			>
				<input {...getInputProps()} {...form.register("files")} />
				<div className="flex flex-col items-center justify-center gap-4">
					<HiArrowUpTray className="w-5 h-5 fill-current" />
					{isDragActive ? (
						<p>Drop the files here ...</p>
					) : (
						<p>Drag & drop files here, or click to select files</p>
					)}
				</div>
			</div>
			{form.formState.errors.files && (
				<Alert variant="destructive" className="mt-5">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{form.formState.errors.files.message}</AlertDescription>
				</Alert>
			)}

			{startUploading && (
				<div
					className={cn(
						"py-4 pl-4 rounded-md border border-green-600 bg-green-100 flex items-center mt-4 transition-opacity duration-300 ease-in-out",
						isMessageVisible ? "opacity-100" : "opacity-0"
					)}
				>
					{isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-600" />}
					<p>{message}</p>
				</div>
			)}

			{/* Preview */}
			<section className="my-10">
				<div className="flex gap-4">
					{(files.length > 0 || rejected.length > 0) && (
						<>
							<h2 className="title text-3xl font-semibold">Preview</h2>
							<Button
								type="button"
								onClick={removeAll}
								variant={"destructive"}
								disabled={isPending}
							>
								Remove all files
							</Button>
						</>
					)}
					{files.length > 0 && (
						<Button
							disabled={isPending}
							className="ml-auto mt-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors"
							variant={"outline"}
							onClick={form.handleSubmit(handleSubmit)}
						>
							Upload to Cloudinary
						</Button>
					)}
				</div>

				<ScrollArea className={cn(isScrollable ? "h-[18rem]" : "h-auto")}>
					<div className="pb-4">
						{/* Accepted files */}
						{files.length > 0 && (
							<>
								<h3 className="title text-lg font-semibold text-neutral-600 mt-10 border-b pb-3">
									Accepted Files
								</h3>
								<ul className="mt-6 flex flex-wrap gap-5">
									{files.map((file, index) => (
										<li
											key={index}
											className="relative rounded-md shadow-md border border-gray-100 p-2 w-40"
										>
											<Image
												src={file.file.preview}
												alt={file.alt}
												width={100}
												height={100}
												onLoad={() => {
													URL.revokeObjectURL(file.file.preview);
												}}
												className="h-32 w-full object-contain rounded-md"
											/>
											<Button
												size={"sm"}
												variant={"destructive"}
												className="size-6 rounded-full p-1 absolute -top-2 -right-2"
												disabled={isPending}
												onClick={() => removeFile(file.file.name)}
											>
												<HiMiniXMark color="#fff" size={30} />
											</Button>
											<p className="mt-2 text-neutral-500 text-[12px] font-medium">
												{Helpers.truncateFileName(file.file.name)}
											</p>
											<Input
												placeholder="Alt text"
												className="mt-2 w-full text-sm"
												value={form.watch(`files.${index}.alt`) || ""}
												disabled={isPending}
												onChange={e =>
													form.setValue(
														`files.${index}.alt`,
														e.target.value
													)
												}
											/>
										</li>
									))}
								</ul>
							</>
						)}

						{/* Rejected Files */}
						{rejected.length > 0 && (
							<>
								<h3 className="title text-lg font-semibold text-neutral-600 mt-24 border-b pb-3">
									Rejected Files
								</h3>
								<ScrollArea className="h-52">
									<ul className="mt-6 flex flex-col">
										{rejected.map(({ file, errors }) => (
											<li
												key={file.name}
												className="flex items-start justify-between"
											>
												<div>
													<p className="mt-2 text-neutral-500 text-sm font-medium">
														{Helpers.truncateFileName(file.name)}
													</p>
													<ul className="text-[12px] text-red-400">
														{errors.map(error => (
															<li key={error.code}>
																{error.message}
															</li>
														))}
													</ul>
												</div>
												<Button
													type="button"
													variant={"destructive"}
													onClick={() => removeRejected(file.name)}
												>
													Remove
												</Button>
											</li>
										))}
									</ul>
								</ScrollArea>
							</>
						)}
					</div>
				</ScrollArea>
			</section>
		</>
	);
};

export default MediaUpload;
