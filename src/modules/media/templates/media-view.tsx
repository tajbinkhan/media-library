"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { Accept } from "react-dropzone";
import { HiMiniXMark } from "react-icons/hi2";
import { toast } from "sonner";

import axiosApi from "@/lib/axios-config";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import LoadingBoundary from "@/components/ui/loading-boundary";
import { LoadingButton } from "@/components/ui/loading-button";

import useCustomSWR from "@/hooks/useCustomSWR";
import Helpers from "@/modules/media/helpers/helpers";
import MediaUpload from "@/modules/media/templates/media-upload";
import { apiRoute } from "@/routes/routes";

const acceptedFileTypes: Accept = {
	"image/jpeg": [],
	"image/jpg": [],
	"image/png": [],
	"image/gif": [],
	"image/webp": []
};

export default function MediaView() {
	const [isPending, startTransition] = useTransition();
	const { data, isLoading, refresh } = useCustomSWR(apiRoute.private.media);

	const handleDelete = (id: number) => {
		startTransition(async () => {
			await axiosApi
				.delete(apiRoute.private.media, {
					data: { id }
				})
				.then(() => {
					toast.success("Media deleted successfully");
					refresh();
				})
				.catch(() => {
					toast.error("Failed to delete media");
					refresh();
				});
		});
	};

	return (
		<LoadingBoundary isLoading={isLoading} fallback={<Loader height={20} />}>
			{data && data.data.length === 0 && (
				<div className="flex flex-col gap-5">
					<Alert variant="default">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>No Media Found</AlertTitle>
						<AlertDescription>Upload media files to display them here</AlertDescription>
					</Alert>
					<MediaUpload acceptedFileTypes={acceptedFileTypes} refresh={refresh} />
				</div>
			)}
			{data && data.data.length > 0 && (
				<>
					<ul className="mt-6 flex flex-wrap gap-5">
						{data.data.map((item: MediaData) => (
							<li
								key={item.id}
								className="relative rounded-md shadow-md border border-gray-100 p-2 w-40"
							>
								<Image
									src={item.secureUrl}
									alt={item.alt}
									width={100}
									height={100}
									className="h-32 w-full object-contain rounded-md"
								/>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											size={"sm"}
											variant={"destructive"}
											className="size-6 rounded-full p-1 absolute -top-2 -right-2"
											disabled={isPending}
										>
											<HiMiniXMark color="#fff" size={30} />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Are you absolutely sure?
											</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This can cause your
												website break if the current media is connected to
												any sections of the website.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel disabled={isPending}>
												Cancel
											</AlertDialogCancel>
											<LoadingButton
												text="Confirm"
												loadingText="Deleting..."
												variant="destructive"
												onClick={() => handleDelete(item.id)}
												isLoading={isPending}
											/>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>

								<p className="mt-2 text-neutral-500 text-[12px] font-medium">
									{Helpers.truncateFileName(item.alt)}
								</p>
							</li>
						))}
					</ul>
				</>
			)}
		</LoadingBoundary>
	);
}
