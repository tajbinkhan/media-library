import { Accept } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MediaUpload from "@/modules/media/templates/media-upload";

interface MediaTemplateViewProps {
	mediaJSX: JSX.Element;
	isScrollable?: boolean;
}

export default function MediaTemplateView({ mediaJSX, isScrollable }: MediaTemplateViewProps) {
	const acceptedFileTypes: Accept = {
		"image/jpeg": [],
		"image/jpg": [],
		"image/png": [],
		"image/gif": [],
		"image/webp": []
	};

	return (
		<section>
			<div className="p-8">
				<Tabs defaultValue="media">
					<TabsList>
						<TabsTrigger value="media" className="w-56">
							Media
						</TabsTrigger>
						<TabsTrigger value="upload" className="w-56">
							Upload
						</TabsTrigger>
					</TabsList>
					<TabsContent value="media" className="mt-10">
						<h1 className="title text-3xl font-bold">All Media</h1>
						<div className="mt-10">{mediaJSX}</div>
					</TabsContent>
					<TabsContent value="upload" className="mt-10">
						<h1 className="title text-3xl font-bold">Upload Files</h1>
						<div className="mt-10">
							<MediaUpload
								acceptedFileTypes={acceptedFileTypes}
								maxFileSize={Number(process.env.MAX_FILE_SIZE)}
								isScrollable={isScrollable}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</section>
	);
}
