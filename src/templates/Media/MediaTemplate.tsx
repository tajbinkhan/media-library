"use client";

import { useState } from "react";


import MediaGridView from "@/templates/Media/Components/MediaGridView";
import MediaListView from "@/templates/Media/Components/MediaListView";
import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";

export default function MediaTemplate() {
	const { isUploaderOpen, openUploader, closeUploader } = useMedia();
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	return (
		<div>
			<div className="container mx-auto">
				{/* Header is now handled within the View Components */}

				{/* Media View */}
				<div className="relative">
					{viewMode === "grid" ? (
						<MediaGridView
							onUpload={openUploader}
							viewMode={viewMode}
							onViewModeChange={setViewMode}
						/>
					) : (
						<MediaListView
							onUpload={openUploader}
							viewMode={viewMode}
							onViewModeChange={setViewMode}
						/>
					)}
				</div>
			</div>

			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
		</div>
	);
}
