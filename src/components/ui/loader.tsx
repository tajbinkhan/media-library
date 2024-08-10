import { RotatingLines } from "react-loader-spinner";

interface LoaderProps {
	height?: number;
}

export default function Loader({ height }: LoaderProps) {
	return (
		<div
			className="w-full h-96 flex justify-center items-center"
			style={{
				height: height ? `${height}rem` : "24rem"
			}}
		>
			<RotatingLines
				visible={true}
				strokeWidth="5"
				animationDuration="0.75"
				ariaLabel="rotating-lines-loading"
				strokeColor="#000000"
				width="25"
			/>
		</div>
	);
}
