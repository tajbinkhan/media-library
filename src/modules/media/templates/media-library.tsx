import Image from "next/image";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { HiMiniXMark } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";

import MediaSelect from "@/modules/media/templates/media-select";
import MediaTemplateView from "@/modules/media/templates/media-template-view";
import { ValidateMediaType } from "@/modules/media/validators/media.schema";

interface MediaLibraryProps {
	value: ValidateMediaType;
	onChange: (value: ValidateMediaType) => void;
	isMulti?: boolean;
}

export default function MediaLibrary({ value, onChange, isMulti }: MediaLibraryProps) {
	const [openModal, setOpenModal] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState<MediaData[]>([]);
	const media = value;

	useEffect(() => {
		if (openModal) setSelectedMedia(media);
	}, [media, openModal]);

	const handleRemoveMedia = (index: number) => {
		const newMedia = media.filter((_, i) => i !== index);
		onChange(newMedia);
	};

	const handleSelectedSubmit = () => {
		setOpenModal(false);
		onChange(selectedMedia);
	};

	return (
		<div className="w-full flex gap-2">
			<Dialog open={openModal} onOpenChange={setOpenModal}>
				<DialogTrigger asChild>
					<Button variant={"outline"} className="size-24" type="button">
						<FaPlus />
					</Button>
				</DialogTrigger>
				<DialogContent
					className="min-w-[calc(100vw_-_56px)] min-h-[calc(100vh_-_56px)]"
					onInteractOutside={e => {
						e.preventDefault();
					}}
					onOpenAutoFocus={e => {
						e.preventDefault();
					}}
				>
					<DialogHeader>
						<DialogTitle className="px-8">Choose media or upload new</DialogTitle>
						<DialogDescription asChild>
							<MediaTemplateView
								mediaJSX={
									<MediaSelect
										isMulti={isMulti}
										selectedMedia={selectedMedia}
										setSelectedMedia={setSelectedMedia}
										handleSelectedSubmit={handleSelectedSubmit}
									/>
								}
								isScrollable={true}
							/>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>

			<>
				{media &&
					media.length > 0 &&
					media.map((media, index) => (
						<div key={index} className="relative border border-gray-200 rounded-md">
							<Image
								src={media.secureUrl}
								width={60}
								height={60}
								alt={media.secureUrl}
								className="size-24 rounded-sm object-contain"
							/>
							<Button
								type="button"
								size={"sm"}
								variant={"destructive"}
								className="size-6 rounded-full p-1 absolute -top-2 -right-2"
								onClick={() => handleRemoveMedia(index)}
							>
								<HiMiniXMark color="#fff" size={30} />
							</Button>
						</div>
					))}
			</>
		</div>
	);
}
