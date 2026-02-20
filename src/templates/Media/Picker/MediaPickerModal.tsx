"use client";

import {
	ArrowDown,
	ArrowUp,
	Calendar,
	Check,
	Clock,
	FileImage,
	FileText,
	Grid3X3,
	HardDrive,
	List,
	Loader2,
	Plus,
	RefreshCcw,
	Search,
	Upload,
	X
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";

import MediaUploaderBox from "@/templates/Media/Components/MediaUploaderBox";
import { useMedia } from "@/templates/Media/Contexts/MediaContext";
import MediaPickerSingleView from "@/templates/Media/Picker/MediaPickerSingleView";
import { useMediaListQuery } from "@/templates/Media/Redux/MediaAPISlice";

interface MediaPickerModalProps {
	selectedValue?: MediaItem | MediaItem[] | null;
	onSelect?: (value: MediaItem | MediaItem[] | null) => void;
	multiple?: boolean;
	min?: number;
	max?: number;
	placeholder?: string;
	defaultView?: "grid" | "list";
}

export default function MediaPickerModal({
	selectedValue,
	onSelect,
	multiple = false,
	min = 0,
	max = 1,
	placeholder = "Select media",
	defaultView = "grid"
}: MediaPickerModalProps) {
	const [viewMode, setViewMode] = useState<"grid" | "list">(defaultView);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"id" | "filename" | "fileSize" | "createdAt">("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [page, setPage] = useState(1);
	const [limit] = useState(20);

	// Initialize selected items from props
	const [selectedItems, setSelectedItems] = useState<MediaItem[]>(() => {
		if (multiple) {
			if (Array.isArray(selectedValue)) {
				return selectedValue;
			} else if (selectedValue) {
				return [selectedValue];
			} else {
				return [];
			}
		} else {
			if (Array.isArray(selectedValue)) {
				return selectedValue.slice(0, 1);
			} else if (selectedValue) {
				return [selectedValue];
			} else {
				return [];
			}
		}
	});

	// ========================================================================
	// Selection Logic
	// ========================================================================

	const handleItemSelect = (item: MediaItem) => {
		if (multiple) {
			const isAlreadySelected = selectedItems.some(
				selected => selected.secureUrl === item.secureUrl
			);

			if (isAlreadySelected) {
				const newSelection = selectedItems.filter(
					selected => selected.secureUrl !== item.secureUrl
				);
				if (newSelection.length >= min) {
					setSelectedItems(newSelection);
					onSelect?.(newSelection);
				}
			} else {
				if (selectedItems.length < max) {
					const newSelection = [...selectedItems, item];
					setSelectedItems(newSelection);
					onSelect?.(newSelection);
				}
			}
		} else {
			const newSelection =
				selectedItems.length > 0 && selectedItems[0].secureUrl === item.secureUrl ? [] : [item];
			setSelectedItems(newSelection);
			onSelect?.(newSelection.length > 0 ? newSelection[0] : null);
		}
	};

	const isItemSelected = (item: MediaItem): boolean => {
		return selectedItems.some(selected => selected.secureUrl === item.secureUrl);
	};

	const isItemDisabled = (item: MediaItem): boolean => {
		if (multiple) {
			return selectedItems.length >= max && !isItemSelected(item);
		}
		return false;
	};

	const { isUploaderOpen, openUploader, closeUploader, formatFileSize } = useMedia();

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

	const isImageFile = (mimeType: string | undefined): boolean => {
		return mimeType ? mimeType.startsWith("image/") : false;
	};

	// Fetch media list
	const {
		data: response,
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
	// Data Processing
	// ========================================================================

	const mediaItems = useMemo(() => response?.data || [], [response?.data]);
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
		setPage(1);
	};

	const handleSortChange = (field: "id" | "filename" | "fileSize" | "createdAt") => {
		setSortBy(field);
		setPage(1);
	};

	const handleSortOrderChange = (order: "asc" | "desc") => {
		setSortOrder(order);
		setPage(1);
	};

	// Check if filters are active
	const hasActiveFilters = searchQuery || sortBy !== "createdAt" || sortOrder !== "desc";

	const handleClearFilters = () => {
		setSearchQuery("");
		setSortBy("createdAt");
		setSortOrder("desc");
		setPage(1);
	};

	return (
		<>
			{/* Upload Modal */}
			<MediaUploaderBox isOpen={isUploaderOpen} onClose={closeUploader} />
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" className="flex min-h-12 w-full items-center gap-2 p-3">
						<Plus size={20} />
						<span className="text-sm">
							{selectedItems.length > 0
								? multiple
									? `Add more (${selectedItems.length}/${max} selected)`
									: "Change selection"
								: placeholder}
						</span>
					</Button>
				</DialogTrigger>
				<DialogContent className="w-full lg:max-w-7xl" style={{ maxHeight: "90vh" }}>
					<DialogHeader>
						<DialogTitle>Media Library</DialogTitle>
						<DialogDescription>
							{multiple
								? `Select between ${min} and ${max} media items. Currently selected: ${selectedItems.length}`
								: "Select a media item to add to your form."}
						</DialogDescription>
					</DialogHeader>

					<div>
						{/* Compact Premium Header */}
						<div className="mb-6 space-y-4">
							{/* Top Row: Title, Search, View Switcher, Upload */}
							<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								{/* Title & Stats */}
								<div className="flex-shrink-0">
									<h2 className="bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-gray-100 dark:to-gray-400">
										{multiple ? `Select ${min} to ${max} Items` : "Select a Media Item"}
									</h2>
									<p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
										{isLoading && page === 1 ? (
											<span className="flex items-center gap-2">
												<Loader2 className="h-3 w-3 animate-spin" />
												Loading...
											</span>
										) : pagination ? (
											<span>{mediaItems.length} of {pagination.totalItems} available</span>
										) : (
											<span>{mediaItems.length} available</span>
										)}
										<span className="text-gray-300 dark:text-gray-600">•</span>
										<span className="font-medium text-blue-600 dark:text-blue-400">
											{selectedItems.length} selected
										</span>
									</p>
								</div>

								{/* Actions: Search, View Switcher, Refresh, Upload */}
								<div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
									<div className="relative w-full sm:w-64 lg:w-72">
										<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
										<Input
											placeholder="Search media..."
											value={searchQuery}
											onChange={e => handleSearchChange(e.target.value)}
											className="h-10 border-gray-200 bg-white/50 pl-9 pr-9 shadow-sm backdrop-blur-xs transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900/50 dark:focus:border-blue-400 dark:focus:bg-gray-900"
										/>
										{searchQuery && (
											<button
												onClick={() => handleSearchChange("")}
												className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 focus:outline-hidden dark:hover:text-gray-300"
												aria-label="Clear search"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										)}
									</div>

									<div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
										<Button
											variant={viewMode === "grid" ? "default" : "ghost"}
											size="sm"
											type="button"
											onClick={() => setViewMode("grid")}
											className={`h-8 gap-1 px-2.5 ${viewMode === "grid" ? "" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"}`}
										>
											<Grid3X3 className="h-4 w-4" />
											<span className="sr-only sm:not-sr-only sm:text-xs text-xs font-medium">Grid</span>
										</Button>
										<Button
											variant={viewMode === "list" ? "default" : "ghost"}
											size="sm"
											type="button"
											onClick={() => setViewMode("list")}
											className={`h-8 gap-1 px-2.5 ${viewMode === "list" ? "" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"}`}
										>
											<List className="h-4 w-4" />
											<span className="sr-only sm:not-sr-only sm:text-xs text-xs font-medium">List</span>
										</Button>
									</div>

									<Button
										onClick={() => {
											setPage(1);
											refresh();
										}}
										variant="outline"
										size="sm"
										className="h-10 w-10 p-0 shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900"
										disabled={isLoading}
										title="Refresh media library"
									>
										<RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
									</Button>

									<Button
										onClick={openUploader}
										size="sm"
										className="h-10 gap-2 bg-linear-to-r from-blue-600 to-indigo-600 px-5 text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow"
									>
										<Upload className="h-4 w-4" />
										<span className="hidden sm:inline">Upload</span>
									</Button>
								</div>
							</div>

							{/* Bottom Row: Sort & Filters */}
							<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2 shadow-sm backdrop-blur-xs dark:border-gray-800 dark:bg-gray-900/50">
								<div className="flex flex-wrap items-center gap-3">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Sort by:
										</span>
										<Select value={sortBy} onValueChange={handleSortChange}>
											<SelectTrigger className="h-8 w-[140px] border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-gray-600">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="createdAt">
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-gray-500" />
														<span>Date Created</span>
													</div>
												</SelectItem>
												<SelectItem value="filename">
													<div className="flex items-center gap-2">
														<FileText className="h-4 w-4 text-gray-500" />
														<span>File Name</span>
													</div>
												</SelectItem>
												<SelectItem value="fileSize">
													<div className="flex items-center gap-2">
														<HardDrive className="h-4 w-4 text-gray-500" />
														<span>File Size</span>
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm dark:border-gray-700 dark:bg-gray-950">
										<Button
											variant={sortOrder === "desc" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => handleSortOrderChange("desc")}
											className={`h-7 gap-1.5 px-2.5 text-xs ${sortOrder === "desc" ? "shadow-sm" : ""}`}
										>
											<ArrowDown className="h-3.5 w-3.5" />
											Desc
										</Button>
										<Button
											variant={sortOrder === "asc" ? "secondary" : "ghost"}
											size="sm"
											onClick={() => handleSortOrderChange("asc")}
											className={`h-7 gap-1.5 px-2.5 text-xs ${sortOrder === "asc" ? "shadow-sm" : ""}`}
										>
											<ArrowUp className="h-3.5 w-3.5" />
											Asc
										</Button>
									</div>
								</div>

								{/* Clear Filters Button */}
								<div className="flex items-center gap-2">
									{hasActiveFilters && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleClearFilters}
											className="h-8 gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
										>
											<X className="h-3.5 w-3.5" />
											Reset Filters
										</Button>
									)}
								</div>
							</div>
						</div>
					</div>

					<ScrollArea className="flex-1 h-[60vh] rounded-md">
						{viewMode === "grid" ? (
							<div className="pr-4 p-2">
								<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
									{mediaItems.map(item => (
										<MediaPickerSingleView
											key={item.secureUrl}
											item={item}
											refresh={refresh}
											isSelected={isItemSelected(item)}
											onSelect={() => handleItemSelect(item)}
											disabled={isItemDisabled(item)}
										/>
									))}
								</div>
							</div>
						) : (
							<div className="flex flex-col pr-4 p-2">
								{mediaItems.map((item, index) => {
									const selected = isItemSelected(item);
									const canSelect = !isItemDisabled(item);

									return (
										<div
											key={item.publicId}
											onClick={() => canSelect && handleItemSelect(item)}
											className={`group flex items-center gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-sm mb-2 ${
												selected ? "bg-white dark:bg-gray-800/80 ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-sm" : "border border-transparent"
											} ${!canSelect ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
										>
											{/* Thumbnail */}
											<div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border transition-all ${selected ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}`}>
												{isImageFile(item.mimeType) ? (
													<Image
														src={item.secureUrl}
														alt={item.altText || item.filename}
														className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
														width={56}
														height={56}
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center">
														<FileImage className="h-6 w-6 text-gray-400" />
													</div>
												)}
												{selected && (
													<div className="absolute inset-0 flex items-center justify-center bg-blue-600/80 backdrop-blur-[2px]">
														<Check className="h-5 w-5 text-white" />
													</div>
												)}
											</div>

											{/* Details */}
											<div className="flex-1 overflow-hidden">
												<h4 className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
													{item.filename}
												</h4>
												<div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
													<span className="flex items-center gap-1 font-medium">
														<HardDrive className="h-3 w-3 opacity-70" />
														{formatFileSize(item.fileSize || 0)}
													</span>
													<span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3 opacity-70" />
														{formatDate(item.createdAt)}
													</span>
													{item.width && item.height && (
														<>
															<span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
															<span className="flex items-center gap-1 opacity-80">
																<FileImage className="h-3 w-3 opacity-70" />
																{item.width} × {item.height}
															</span>
														</>
													)}
												</div>
											</div>

											{/* Selection Indicator */}
											<div className="shrink-0 pr-2">
												{selected ? (
													<Badge variant="default" className="bg-blue-600 shadow-sm">
														<Check className="h-3.5 w-3.5" />
													</Badge>
												) : (
													<div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white transition-colors group-hover:border-blue-400 dark:border-gray-600 dark:bg-gray-900" />
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}

						{/* Load More Button inside ScrollArea */}
						{hasNextPage && (
							<div className="flex justify-center border-t border-gray-100 dark:border-gray-800 p-4 mt-4 mb-8">
								<Button
									onClick={handleLoadMore}
									disabled={isFetching}
									variant="outline"
									className="gap-2 shadow-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-all"
								>
									{isFetching ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Loading more items...
										</>
									) : (
										<>Load More Media</>
									)}
								</Button>
							</div>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
