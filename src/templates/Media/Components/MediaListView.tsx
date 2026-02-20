"use client";

import {
    ArrowDown,
    ArrowUp,
    Calendar,
    Clock,
    Download,
    Edit,
    FileImage,
    Grid3X3,
    HardDrive,
    List,
    Loader2,
    MoreVertical,
    Search,
    Trash2,
    Upload,
    X
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useMediaDownload } from "@/templates/Media/Hooks/useMediaDownload";
import { useMediaListQuery } from "@/templates/Media/Redux/MediaAPISlice";
import MediaDeleteAlert from "./MediaDeleteAlert";
import MediaEditModal from "./MediaEditModal";
import MediaPreviewModal from "./MediaPreviewModal";

// ============================================================================
// Component
// ============================================================================

export default function MediaListView({ onUpload, viewMode, onViewModeChange, className = "" }: MediaListViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"id" | "filename" | "fileSize" | "createdAt">("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);

	// State for modals
	const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
	const [editItem, setEditItem] = useState<MediaItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

	const { download } = useMediaDownload();

	// Fetch media list
	const {
		data: response,
		error,
		isLoading,
		isFetching,
		refetch: refresh
	} = useMediaListQuery({
		page,
		limit,
		search: searchQuery || undefined,
		sortBy,
		sortOrder
	});

	// ========================================================================
	// Utility Functions
	// ========================================================================

	const formatDate = (dateString: string | undefined): string => {
		if (!dateString) return "Unknown";
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		} catch {
			return "Unknown";
		}
	};

	const formatFileSize = (bytes: number | undefined): string => {
		if (!bytes) return "Unknown";
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
	};

	const isImageFile = (type: string | undefined): boolean => {
		return Boolean(type && type.startsWith("image/"));
	};

	// ========================================================================
	// Data Processing
	// ========================================================================

	const mediaItems = response?.data || [];
	const pagination = response?.pagination;
	const hasNextPage = pagination?.hasNextPage || false;

	// ========================================================================
	// Handlers
	// ========================================================================

	const handleLoadMore = () => {
		if (hasNextPage && !isFetching) {
			setPage(prev => prev + 1);
		}
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setPage(1); // Reset to first page on search
	};

	const handleSortChange = (field: "id" | "filename" | "fileSize" | "createdAt") => {
		setSortBy(field);
		setPage(1);
	};

	const handleSortOrderChange = (order: "asc" | "desc") => {
		setSortOrder(order);
		setPage(1);
	};

	const handleDownload = async (item: MediaItem) => {
		await download(item);
	};

	// ========================================================================
	// Render Functions
	// ========================================================================

	const renderLoadingSkeleton = () => (
		<div className="space-y-3">
			{Array.from({ length: 5 }).map((_, index) => (
				<Card key={index} className="flex items-center gap-4 p-4">
					<Skeleton className="h-16 w-16 rounded-md" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="h-8 w-8" />
				</Card>
			))}
		</div>
	);

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-6 rounded-full bg-linear-to-br from-blue-50 to-indigo-100 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
				<HardDrive className="h-12 w-12 text-blue-500" />
			</div>
			<h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
				No media files yet
			</h3>
			<p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
				Start building your media library by uploading your first files.
			</p>
			<Button
				onClick={onUpload}
				className="bg-linear-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
			>
				<Upload className="mr-2 h-4 w-4" />
				Upload Your First File
			</Button>
		</div>
	);

	const renderErrorState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<div className="mb-6 rounded-full bg-linear-to-br from-red-50 to-red-100 p-6 dark:from-red-900/20 dark:to-red-900/20">
				<Trash2 className="h-12 w-12 text-red-500" />
			</div>
			<h3 className="mb-3 text-xl font-semibold text-red-900 dark:text-red-100">
				Unable to load media files
			</h3>
			<p className="mb-6 max-w-md text-sm text-red-600 dark:text-red-400">
				{error &&
				"data" in error &&
				typeof error.data === "object" &&
				error.data &&
				"message" in error.data
					? String(error.data.message)
					: error && "message" in error && error.message
						? error.message
						: "Something went wrong while fetching your media files. Please try again."}
			</p>
			<Button type="button" onClick={() => refresh()} variant="destructive">
				Try Again
			</Button>
		</div>
	);

	const renderNoResultsState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<Search className="mb-4 h-12 w-12 text-gray-400" />
			<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
				No results found
			</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400">
				Try adjusting your search or filters
			</p>
		</div>
	);

	// ========================================================================
	// Main Render
	// ========================================================================

	// Check if filters are active
	const hasActiveFilters = searchQuery || sortBy !== "createdAt" || sortOrder !== "desc";

	const handleClearFilters = () => {
		setSearchQuery("");
		setSortBy("createdAt");
		setSortOrder("desc");
		setPage(1);
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Compact Premium Header */}
			<div className="mb-6 space-y-4">
				{/* Top Row: Title, Search, View Switcher, Upload */}
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					{/* Title & Stats */}
					<div className="flex-shrink-0">
						<h2 className="bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-gray-100 dark:to-gray-400">
							Media Library
						</h2>
						<p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
							{isLoading && page === 1 ? (
								<span className="flex items-center">
									<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-blue-500" />
									Loading...
								</span>
							) : pagination ? (
								<span>
									<strong className="text-gray-700 dark:text-gray-300">{pagination.totalItems}</strong> items
								</span>
							) : (
								<span>
									<strong className="text-gray-700 dark:text-gray-300">{mediaItems.length}</strong> items
								</span>
							)}
						</p>
					</div>

					{/* Actions: Search, View Mode, Upload */}
					<div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
						<div className="relative w-full sm:w-64 lg:w-72">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Search media..."
								value={searchQuery}
								onChange={e => handleSearchChange(e.target.value)}
								className="h-10 border-gray-200 bg-white/50 pr-8 pl-9 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:focus:border-blue-400 dark:focus:bg-gray-800"
							/>
							{searchQuery && (
								<button
									onClick={() => handleSearchChange("")}
									className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>

						<div className="hidden items-center sm:flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
							<Button
								variant={viewMode === "grid" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => onViewModeChange?.("grid")}
								className={`h-8 w-9 px-0 ${viewMode === "grid" ? "shadow-sm" : ""}`}
								title="Grid View"
							>
								<Grid3X3 className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "secondary" : "ghost"}
								size="sm"
								onClick={() => onViewModeChange?.("list")}
								className={`h-8 w-9 px-0 ${viewMode === "list" ? "shadow-sm" : ""}`}
								title="List View"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>

						{onUpload && (
							<Button
								onClick={onUpload}
								size="sm"
								className="h-10 gap-2 bg-linear-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow"
							>
								<Upload className="h-4 w-4" />
								<span className="hidden sm:inline">Upload</span>
							</Button>
						)}
					</div>
				</div>

				{/* Bottom Row: Sort & Filters */}
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2 shadow-sm backdrop-blur-xs dark:border-gray-800 dark:bg-gray-900/50">
					<div className="flex flex-wrap items-center gap-2">
						<Select value={sortBy} onValueChange={handleSortChange}>
							<SelectTrigger className="h-8 w-36 border-transparent bg-transparent shadow-none hover:bg-gray-100 dark:hover:bg-gray-800">
								<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
									<Clock className="h-3.5 w-3.5" />
									<SelectValue placeholder="Sort by" />
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="createdAt">Date Created</SelectItem>
								<SelectItem value="filename">File Name</SelectItem>
								<SelectItem value="fileSize">File Size</SelectItem>
							</SelectContent>
						</Select>

						<div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
							className="h-8 gap-2 px-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
						>
							{sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
							<span className="text-sm">{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
						</Button>

						{hasActiveFilters && (
							<>
								<div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
									className="h-8 gap-1.5 px-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
								>
									<X className="h-3.5 w-3.5" />
									<span className="text-sm">Clear</span>
								</Button>
							</>
						)}
					</div>

					{/* Mobile View Switcher (visible only on small screens) */}
					<div className="flex items-center sm:hidden rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange?.("grid")}
							className={`h-7 w-8 px-0 ${viewMode === "grid" ? "shadow-sm" : ""}`}
						>
							<Grid3X3 className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => onViewModeChange?.("list")}
							className={`h-7 w-8 px-0 ${viewMode === "list" ? "shadow-sm" : ""}`}
						>
							<List className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</div>

			{/* Content */}
			{isLoading && page === 1 ? (
				renderLoadingSkeleton()
			) : error ? (
				renderErrorState()
			) : mediaItems.length === 0 ? (
				searchQuery ? (
					renderNoResultsState()
				) : (
					renderEmptyState()
				)
			) : (
				<>
					{/* List Items */}
					<ScrollArea
						className="w-full"
						style={{
							height: `calc(100vh - 350px)`,
							maxHeight: "800px",
							minHeight: "400px"
						}}
					>
						<div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
							{mediaItems.map((item, index) => (
								<div
									key={item.publicId}
									className={`group flex items-center gap-4 p-3 sm:p-4 transition-colors hover:bg-gray-50 hover:shadow-inner dark:hover:bg-white/5 ${
										index !== mediaItems.length - 1 ? "border-b border-gray-100 dark:border-gray-800/50" : ""
									}`}
								>
									{/* Thumbnail */}
									<div
										className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800"
										onClick={() => setPreviewItem(item)}
									>
										{isImageFile(item.mimeType) ? (
											<Image
												src={item.secureUrl}
												alt={item.altText || item.filename}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
												width={64}
												height={64}
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<FileImage className="h-8 w-8 text-gray-400" />
											</div>
										)}
									</div>

									{/* Details */}
									<div className="flex-1 overflow-hidden">
										<h4
											className="cursor-pointer truncate text-sm sm:text-base font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400"
											onClick={() => setPreviewItem(item)}
										>
											{item.filename}
										</h4>
										<div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
											<span className="flex items-center gap-1.5 font-medium">
												<HardDrive className="h-3.5 w-3.5 opacity-70" />
												{formatFileSize(item.fileSize)}
											</span>
											<span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
											<span className="flex items-center gap-1.5">
												<Calendar className="h-3.5 w-3.5 opacity-70" />
												{formatDate(item.createdAt)}
											</span>
											{item.width && item.height && (
												<>
													<span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
													<span className="flex items-center gap-1.5 opacity-80">
														<FileImage className="h-3 w-3 opacity-70" />
														{item.width} × {item.height}
													</span>
												</>
											)}
										</div>
									</div>

									{/* Actions */}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => setPreviewItem(item)}>
												<FileImage className="mr-2 h-4 w-4" />
												Preview
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setEditItem(item)}>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDownload(item)}>
												<Download className="mr-2 h-4 w-4" />
												Download
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-600">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))}
						</div>
						<ScrollBar orientation="vertical" />
					</ScrollArea>

					{/* Load More Button */}
					{hasNextPage && (
						<div className="flex justify-center pt-6">
							<Button
								onClick={handleLoadMore}
								disabled={isFetching}
								variant="outline"
								size="lg"
								className="gap-2"
							>
								{isFetching ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading...
									</>
								) : (
									<>Load More</>
								)}
							</Button>
						</div>
					)}
				</>
			)}

			{/* Modals */}
			{previewItem && (
				<MediaPreviewModal
					item={previewItem}
					onClose={() => setPreviewItem(null)}
					refresh={refresh}
				/>
			)}

			{editItem && (
				<MediaEditModal
					item={editItem}
					onClose={() => setEditItem(null)}
					onSave={() => {
						setEditItem(null);
						refresh();
					}}
					onCancel={() => setEditItem(null)}
				/>
			)}

			{deleteItem && (
				<MediaDeleteAlert
					item={deleteItem}
					onClose={() => setDeleteItem(null)}
					onSuccess={() => {
						setDeleteItem(null);
						refresh();
					}}
				/>
			)}
		</div>
	);
}
