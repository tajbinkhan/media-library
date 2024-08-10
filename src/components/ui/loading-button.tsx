"use client";

import { LuLoader2 } from "react-icons/lu";

import LoadingBoundary from "@/components/ui/loading-boundary";

import { Button, ButtonProps } from "./button";

type LoadingButtonProps = ButtonProps & {
	isLoading: boolean;
	text: string;
	loadingText: string;
	variantLoading?: "loading" | "destructiveLoading";
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
	isLoading,
	text,
	loadingText,
	variant = "default",
	variantLoading = "loading",
	className,
	...rest
}) => {
	return (
		<Button
			type="submit"
			variant={isLoading ? (variantLoading ? variantLoading : variant) : variant}
			className={className}
			disabled={isLoading}
			{...rest}
		>
			<LoadingBoundary
				isLoading={isLoading}
				fallback={
					<>
						<LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
						{loadingText}
					</>
				}
			>
				{text}
			</LoadingBoundary>
		</Button>
	);
};
