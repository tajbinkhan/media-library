import { createApi } from "@reduxjs/toolkit/query/react";

import { createBaseQueryWithCSRF } from "@/lib/rtk-base-query";

import { MEDIA_API_URL } from "@/templates/Media/Constants/Media.constant";
import { mediaApiRoutes } from "@/templates/Media/Routes/MediaRoutes";

export const mediaApiSlice = createApi({
	reducerPath: "mediaApiReducer",
	keepUnusedDataFor: 0,
	baseQuery: createBaseQueryWithCSRF({ baseUrl: MEDIA_API_URL }),
	tagTypes: ["Media"],
	endpoints: builder => ({
		mediaList: builder.query<MediaListResponse, MediaQueryParams | void>({
			query: params => {
				const queryParams = new URLSearchParams();

				if (params) {
					if (params.page) queryParams.append("page", params.page.toString());
					if (params.limit) queryParams.append("limit", params.limit.toString());
					if (params.search) queryParams.append("search", params.search);
					if (params.sortBy) queryParams.append("sortBy", params.sortBy);
					if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
					if (params.offset !== undefined) queryParams.append("offset", params.offset.toString());
				}

				const queryString = queryParams.toString();
				return {
					url: `${mediaApiRoutes.media}${queryString ? `?${queryString}` : ""}`,
					method: "GET"
				};
			},
			providesTags: ["Media"],
			// Merge new results with existing ones for "load more" functionality
			serializeQueryArgs: ({ endpointName }) => {
				return endpointName;
			},
			merge: (currentCache, newResponse, { arg }) => {
				// If it's the first page or page 1, replace the cache
				if (!arg || arg.page === 1 || arg.offset === 0) {
					return newResponse;
				}
				// Otherwise, append to existing data
				if (currentCache?.data && newResponse?.data) {
					return {
						...newResponse,
						data: [...currentCache.data, ...newResponse.data]
					};
				}
				return newResponse;
			},
			forceRefetch: ({ currentArg, previousArg }) => {
				return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
			}
		}),
		mediaUpload: builder.mutation<ApiResponse<MediaItem>, FormData>({
			query: formData => ({
				url: mediaApiRoutes.mediaUpload,
				method: "POST",
				body: formData
			}),
			invalidatesTags: ["Media"]
		}),
		mediaUpdate: builder.mutation<
			ApiResponse<MediaItem>,
			{ publicId: string; data: Partial<MediaItem> }
		>({
			query: ({ publicId, data }) => ({
				url: mediaApiRoutes.mediaPublicId(publicId),
				method: "PUT",
				body: data
			}),
			invalidatesTags: ["Media"]
		}),
		mediaDelete: builder.mutation<ApiResponse<void>, string>({
			query: publicId => ({
				url: mediaApiRoutes.mediaPublicId(publicId),
				method: "DELETE"
			}),
			invalidatesTags: ["Media"]
		}),
		mediaDownload: builder.query<Blob, string>({
			query: publicId => ({
				url: mediaApiRoutes.mediaDownload(publicId),
				method: "GET",
				responseHandler: response => response.blob()
			})
		})
	})
});

// Export hooks
export const {
	useMediaListQuery,
	useMediaUploadMutation,
	useMediaUpdateMutation,
	useMediaDeleteMutation,
	useMediaDownloadQuery
} = mediaApiSlice;

export const mediaApiReducer = mediaApiSlice.reducer;
