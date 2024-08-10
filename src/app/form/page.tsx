"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Dump from "@/components/global/dump";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import MediaLibrary from "@/modules/media/templates/media-library";
import { validateMedia } from "@/modules/media/validators/media.schema";

const schema = z.object({
	username: z.string(),
	media: validateMedia(),
	image: validateMedia()
});

type SchemaType = z.infer<typeof schema>;

export default function PageForm() {
	const form = useForm<SchemaType>({
		resolver: zodResolver(schema),
		defaultValues: {
			username: "",
			media: [],
			image: []
		}
	});

	useEffect(() => {
		form.setValue("media", [
			{
				id: 50,
				title: "sgsfqohk2hsdlfcvnlde",
				alt: "white-logo",
				assetId: "6cb434cb8a1c4278ad6ca65072d69e38",
				publicId: "Testing/sgsfqohk2hsdlfcvnlde",
				versionId: "9e77bd0eb6e6bf5496884752f0818399",
				signature: "2a6a54a234eb427ac8c1f7340a3cc70a594b443a",
				width: 756,
				height: 688,
				format: "webp",
				resourceType: "image",
				url: "http://res.cloudinary.com/dtcqie3bd/image/upload/v1722062055/Testing/sgsfqohk2hsdlfcvnlde.webp",
				secureUrl:
					"https://res.cloudinary.com/dtcqie3bd/image/upload/v1722062055/Testing/sgsfqohk2hsdlfcvnlde.webp",
				assetFolder: "Testing",
				displayName: "file",
				originalFilename: "file",
				createdAt: "2024-07-27T06:34:19.374Z",
				updatedAt: "2024-07-27T06:34:19.374Z"
			}
		]);
	}, [form]);

	const onSubmit = async (data: SchemaType) => {
		console.log(data);
	};

	return (
		<>
			<Form {...form}>
				<Dump data={form.watch()} />
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormDescription>This is your public display name.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="media"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Media</FormLabel>
								<FormControl>
									<>
										<MediaLibrary
											value={field.value}
											onChange={field.onChange}
											isMulti
										/>
									</>
								</FormControl>
								<FormDescription>This is your public display name.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="image"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Image</FormLabel>
								<FormControl>
									<>
										<MediaLibrary
											value={field.value}
											onChange={field.onChange}
										/>
									</>
								</FormControl>
								<FormDescription>This is your public display name.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</>
	);
}
