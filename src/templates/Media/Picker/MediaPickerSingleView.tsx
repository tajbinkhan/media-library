"use client";

import {
	Calendar,
	Check,
	Copy,
	Download,
	Edit3,
	File,
	FileImage,
	FileText,
	FileVideo,
	Loader2,
	Music,
	Trash2
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useMediaDownload } from "../Hooks/useMediaDownload";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import MediaDeleteAlert from "@/templates/Media/Components/MediaDeleteAlert";
import MediaEditModal from "@/templates/Media/Components/MediaEditModal";
import MediaPreviewModal from "@/templates/Media/Components/MediaPreviewModal";

// ============================================================================
// Component
// ============================================================================

export default function MediaPickerSingleView({
	item,
	refresh,
	isSelected = false,
	onSelect,
	disabled = false
}: MediaPickerSingleViewProps) {
	// ========================================================================
	// State Management
	// ========================================================================

	const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
	const [editItem, setEditItem] = useState<MediaItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
	const [copySuccess, setCopySuccess] = useState<string | null>(null);

	// Download hook
	const { downloadState, download } = useMediaDownload();

	// ========================================================================
	// Event Handlers
	// ========================================================================

	const handleItemClick = () => {
		// Select the item only if not disabled
		if (!disabled && onSelect) {
			onSelect();
		}
	};

	const handleItemPreview = () => {
		setPreviewItem(item);
	};

	const handleEditStart = () => {
		setEditItem(item);
	};

	const handleDeleteStart = () => {
		setDeleteItem(item);
	};

	const handleDeleteSuccess = () => {
		refresh();
	};

	const handleCloseDelete = () => {
		setDeleteItem(null);
	};

	const handleCopyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopySuccess(`item-${item.secureUrl}`);
			setTimeout(() => setCopySuccess(null), 2000);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	};

	const handleDownloadFile = async (mediaItem: MediaItem) => {
		await download(mediaItem);
	};

	const handleEditSave = () => {
		setEditItem(null);
		refresh();
	};

	const handleEditCancel = () => {
		setEditItem(null);
	};

	const handleClosePreview = () => {
		setPreviewItem(null);
	};

	const handleCloseEdit = () => {
		setEditItem(null);
	};

	const formatFileSize = (bytes: number | undefined): string => {
		if (!bytes || bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const formatDate = (dateString: string | undefined): string => {
		if (!dateString) return "Unknown";
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		} catch {
			return "Unknown";
		}
	};

	const getFileIcon = (type: string | undefined) => {
		if (!type) return <File className="h-6 w-6 text-gray-400" />;

		if (type.startsWith("image/")) return <FileImage className="h-6 w-6 text-blue-500" />;
		if (type.startsWith("video/")) return <FileVideo className="h-6 w-6 text-purple-500" />;
		if (type.startsWith("audio/")) return <Music className="h-6 w-6 text-green-500" />;
		if (type.includes("pdf") || type.includes("document"))
			return <FileText className="h-6 w-6 text-red-500" />;

		return <File className="h-6 w-6 text-gray-400" />;
	};

	const getFileTypeLabel = (type: string | undefined) => {
		if (!type) return "Unknown";

		const typeMap: Record<string, string> = {
			"image/jpeg": "JPEG",
			"image/png": "PNG",
			"image/gif": "GIF",
			"image/webp": "WebP",
			"video/mp4": "MP4",
			"video/mov": "MOV",
			"audio/mp3": "MP3",
			"audio/wav": "WAV",
			"application/pdf": "PDF"
		};

		return typeMap[type] || type.split("/")[1]?.toUpperCase() || "FILE";
	};

	const isImageFile = (type: string | undefined): boolean => {
		return Boolean(type && type.startsWith("image/"));
	};

	// ========================================================================
	// Render
	// ========================================================================

	const isImage = isImageFile(item.mimeType);
	const fileIcon = getFileIcon(item.mimeType);
	const fileTypeLabel = getFileTypeLabel(item.mimeType);

	return (
		<>
			<Card
				className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-300 dark:bg-gray-950 p-0 ${
					disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:-translate-y-1 hover:shadow-xl"
				} ${
					isSelected
						? "border-blue-500 shadow-sm ring-2 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20"
						: "border-gray-100 hover:border-blue-200 dark:border-gray-800 dark:hover:border-blue-900/50 dark:hover:shadow-blue-900/20"
				}`}
				onClick={handleItemClick}
			>
				<CardContent className="p-0">
					{/* Media Preview */}
					<div className="relative aspect-square bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
						{isImage && item.secureUrl ? (
							<>
								<Image
									src={item.secureUrl}
									alt={item.altText || item.filename || "Media file"}
									fill
									className="object-cover transition-all duration-500 group-hover:scale-105"
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
									unoptimized={true}
								/>
								<div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

								{/* Selection Indicator */}
								{isSelected && (
									<div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
										<Check size={16} />
									</div>
								)}
							</>
						) : (
							<div className="flex h-full items-center justify-center">
								<div className="p-6 text-center">
									<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
										{fileIcon}
									</div>
									<Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
										{fileTypeLabel}
									</Badge>
								</div>

								{/* Selection Indicator for non-image files */}
								{isSelected && (
									<div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
										<Check size={16} />
									</div>
								)}
							</div>
						)}

						{/* Quick Actions Overlay */}
						<div className="absolute right-3 top-3 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
							<div className="flex flex-col gap-2 rounded-xl bg-white/20 p-2 shadow-sm backdrop-blur-md dark:bg-black/40 border border-white/20 dark:border-white/10">
								<Button
									size="sm"
									variant="secondary"
									className="h-8 w-8 rounded-lg bg-white/90 p-0 shadow-sm transition-colors hover:bg-white text-gray-700 hover:text-blue-600 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-blue-400"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleCopyToClipboard(item.secureUrl);
									}}
									title="Copy link"
								>
									{copySuccess === `item-${item.secureUrl}` ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
								<Button
									size="sm"
									variant="secondary"
									className="h-8 w-8 rounded-lg bg-white/90 p-0 shadow-sm transition-colors hover:bg-white text-gray-700 hover:text-indigo-600 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-indigo-400"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleDownloadFile(item);
									}}
									disabled={
										downloadState.isDownloading &&
										downloadState.downloadingFileId === item.secureUrl
									}
									title={
										downloadState.isDownloading &&
										downloadState.downloadingFileId === item.secureUrl
											? `Downloading... ${downloadState.progress}%`
											: "Download file"
									}
								>
									{downloadState.isDownloading &&
									downloadState.downloadingFileId === item.secureUrl ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Download className="h-4 w-4" />
									)}
								</Button>
								<Button
									variant="destructive"
									size="sm"
									className="h-8 w-8 rounded-lg bg-red-50 p-0 text-red-600 shadow-sm transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleDeleteStart();
									}}
									title="Delete file"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* File type badge for non-images */}
						{!isImage && (
							<div className="absolute bottom-3 left-3">
								<Badge
									variant="secondary"
									className="bg-white/90 text-xs font-medium dark:bg-gray-900/90"
								>
									{fileTypeLabel}
								</Badge>
							</div>
						)}
					</div>

					{/* Enhanced File Info */}
					<div className="flex flex-1 flex-col justify-between bg-white p-4 dark:bg-gray-950 border-t border-gray-50 dark:border-gray-900">
						<div className="mb-3 flex items-start justify-between">
							<div className="min-w-0 flex-1 pr-3">
								<h4
									className="truncate text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400"
									title={item.filename || "Unknown file"}
								>
									{item.filename || "Unknown file"}
								</h4>
								{(item.altText || fileTypeLabel) && (
									<p
										className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400"
										title={item.altText || fileTypeLabel}
									>
										{item.altText || fileTypeLabel}
									</p>
								)}
							</div>
							{/* Edit Button */}
							<Button
								variant="outline"
								size="sm"
								className="h-7 w-7 shrink-0 rounded-full p-0 opacity-0 transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 group-hover:opacity-100 dark:hover:border-orange-900/50 dark:hover:bg-orange-900/20"
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									handleEditStart();
								}}
								title="Edit details"
							>
								<Edit3 className="h-3.5 w-3.5" />
							</Button>
						</div>

						<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800/50 mt-auto">
							<span className="font-medium">
								{formatFileSize(item.fileSize)}
							</span>
							<span className="flex items-center">
								<Calendar className="mr-1.5 h-3.5 w-3.5 opacity-70" />
								{formatDate(item.createdAt)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Modal Components */}
			<MediaPreviewModal item={previewItem} onClose={handleClosePreview} refresh={refresh} />
			<MediaEditModal
				item={editItem}
				onClose={handleCloseEdit}
				onSave={handleEditSave}
				onCancel={handleEditCancel}
			/>
			<MediaDeleteAlert
				item={deleteItem}
				onClose={handleCloseDelete}
				onSuccess={handleDeleteSuccess}
			/>
		</>
	);
}

// ============================================================================
// Export
// ============================================================================
