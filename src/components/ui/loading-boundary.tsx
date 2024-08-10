import React from "react";

type BaseLoadingBoundaryProps = {
	isLoading: boolean;
	fallback: React.ReactNode;
	children: React.ReactNode;
};

type WithErrorProps = BaseLoadingBoundaryProps & {
	isError: boolean;
	errorFallback: React.ReactNode;
};

type WithoutErrorProps = BaseLoadingBoundaryProps & {
	isError?: never;
	errorFallback?: never;
};

type LoadingBoundaryProps = WithErrorProps | WithoutErrorProps;

export default function LoadingBoundary({
	isLoading,
	fallback,
	children,
	isError,
	errorFallback
}: LoadingBoundaryProps) {
	if (isLoading) {
		return <>{fallback}</>;
	}

	if (isError) {
		return <>{errorFallback}</>;
	}

	return <>{children}</>;
}
