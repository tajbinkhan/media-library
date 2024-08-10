import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

import MediaSelect from "@/modules/media/templates/media-select";
import MediaTemplateView from "@/modules/media/templates/media-template-view";

interface MediaModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedMedia: MediaData[];
	setSelectedMedia: React.Dispatch<React.SetStateAction<MediaData[]>>;
	handleSelectedSubmit: () => void;
	isMulti?: boolean;
}

export default function MediaModal({
	open,
	setOpen,
	selectedMedia,
	setSelectedMedia,
	handleSelectedSubmit,
	isMulti
}: MediaModalProps) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
	);
}
