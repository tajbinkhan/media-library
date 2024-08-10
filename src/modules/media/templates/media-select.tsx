"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Accept } from "react-dropzone";
import { HiMiniXMark } from "react-icons/hi2";
import { ImCancelCircle } from "react-icons/im";
import { toast } from "sonner";

import axiosApi from "@/lib/axios-config";
import { cn } from "@/lib/utils";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/ui/loader";
import LoadingBoundary from "@/components/ui/loading-boundary";
import { LoadingButton } from "@/components/ui/loading-button";
import { ScrollArea } from "@/components/ui/scroll-area";

import useCustomSWR from "@/hooks/useCustomSWR";
import Helpers from "@/modules/media/helpers/helpers";
import Media from "@/modules/media/templates/media-upload";
import { apiRoute } from "@/routes/routes";

const acceptedFileTypes: Accept = {
	"image/jpeg": [],
	"image/jpg": [],
	"image/png": [],
	"image/gif": [],
	"image/webp": []
};

interface MediaSelectProps {
	isMulti?: boolean;
	selectedMedia: MediaData[];
	setSelectedMedia: React.Dispatch<React.SetStateAction<MediaData[]>>;
	handleSelectedSubmit: () => void;
}

export default function MediaSelect({
	isMulti = false,
	selectedMedia,
	setSelectedMedia,
	handleSelectedSubmit
}: MediaSelectProps) {
	const [onHover, setOnHover] = useState<{ index: number; boolean: boolean } | null>(null);
	const [isPending, startTransition] = useTransition();
	const [search, setSearch] = useState("");
	const [isClearable, setIsClearable] = useState(false);
	const [media, setMedia] = useState<MediaData[]>([]);
	const { data, isLoading, refresh } = useCustomSWR(apiRoute.private.media);

	useEffect(() => {
		if (data && data.data) {
			setMedia(data.data);
		}
	}, [data]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);

		const filteredMedia = data.data.filter((item: MediaData) =>
			item.alt.toLowerCase().includes(e.target.value.toLowerCase())
		);

		setMedia(filteredMedia);
		if (e.target.value === "") {
			setIsClearable(false);
		} else {
			setIsClearable(true);
		}
	};

	const handleClearSearch = () => {
		setSearch("");
		setIsClearable(false);
		setMedia(data.data);
	};

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

	const handleSelect = (media: MediaData) => {
		if (isMulti) {
			if (selectedMedia.find(item => item.id === media.id)) {
				setSelectedMedia(selectedMedia.filter(item => item.id !== media.id));
			} else {
				setSelectedMedia([...selectedMedia, media]);
			}
		} else {
			if (selectedMedia.find(item => item.id === media.id)) {
				setSelectedMedia([]);
			} else {
				setSelectedMedia([media]);
			}
		}
	};

	const isSelected = (media: MediaData) => {
		const getIndex =
			selectedMedia.findIndex(item => item.id === media.id) !== -1 &&
			selectedMedia.findIndex(item => item.id === media.id) + 1;
		const data = {
			value: selectedMedia.some(item => item.id === media.id),
			index: getIndex
		};
		return data;
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
					<Media acceptedFileTypes={acceptedFileTypes} refresh={refresh} />
				</div>
			)}
			{data && data.data.length > 0 && (
				<>
					<div className="space-y-3 max-w-96">
						<Label>Search Media</Label>
						<div className="relative">
							<Input
								type="text"
								value={search}
								onChange={e => handleSearch(e)}
								placeholder="Search anything by media name"
							/>
							{isClearable && (
								<Button
									variant={"secondary"}
									className="h-fit w-fit p-0 absolute right-2 top-1/2 -translate-y-1/2"
									onClick={handleClearSearch}
								>
									<ImCancelCircle />
								</Button>
							)}
						</div>
					</div>
					<ScrollArea className="h-[30rem] mt-3">
						<ul className="mt-6 flex flex-wrap gap-5 pb-5">
							{media.map((item: MediaData, index: number) => (
								<li
									key={item.id}
									className={cn(
										isSelected(item).value ? "bg-blue-200" : "",
										"relative rounded-md shadow-md border border-gray-100 p-2 cursor-pointer w-40"
									)}
									onClick={() => handleSelect(item)}
									onMouseEnter={() => setOnHover({ index: index, boolean: true })}
									onMouseLeave={() => setOnHover(null)}
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
												{isSelected(item).index &&
													onHover?.index !== index &&
													isSelected(item).index}

												{(onHover?.index === index ||
													!isSelected(item).value) && (
													<HiMiniXMark color="#fff" size={30} />
												)}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Are you absolutely sure?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be undone. This can cause
													your website break if the current media is
													connected to any sections of the website.
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
										{Helpers.truncateName(item.alt, 20)}
									</p>
								</li>
							))}
						</ul>
					</ScrollArea>
					<Button
						className="absolute bottom-4 right-4"
						disabled={selectedMedia.length === 0}
						onClick={handleSelectedSubmit}
					>
						Select
					</Button>
				</>
			)}
		</LoadingBoundary>
	);
}
