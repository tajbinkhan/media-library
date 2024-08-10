import MediaTemplateView from "@/modules/media/templates/media-template-view";
import MediaView from "@/modules/media/templates/media-view";

export default function Home() {
	return <MediaTemplateView mediaJSX={<MediaView />} />;
}
