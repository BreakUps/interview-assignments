import React, { useRef, useState, useEffect, FC, useCallback } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	outerContainer: {
		position: "relative",
		width: "100vw",
		height: "100vh",
		overflow: "hidden",
	},
	innerContainer: {
		position: "absolute",
		display: "flex",
		height: "100%",
	},
	carouselItem: {
		position: "relative",
		width: "100vw",
		height: "100%",
		backgroundPosition: "center",
		backgroundSize: "cover",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	description: {
		position: "absolute",
		bottom: "50%",
	},
	indicatorWrapper: {
		position: "absolute",
		width: "100%",
		bottom: "20px",
		display: "flex",
		justifyContent: "center",
	},
	indicatorItem: {
		width: "60px",
		height: "3px",
	}
})

interface ImageObject {
	url: string;
	title?: string[] | React.ReactNode[];
	description?: string[] | React.ReactNode[];
}

interface CarouselProps {
	images: ImageObject[];
	duration?: number;
}

const Carousel: FC<CarouselProps> = ({ images, duration = 3000 }) => {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState(0);
	const [dragEnd, setDragEnd] = useState(0);
	const [transition, setTransition] = useState("0.5s ease-out");
	const sliderRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<NodeJS.Timeout>();

	const getNextSlide = (current: number, delta: number) => {
		let next = current + delta;
		if (next < 0) {
			next = images.length - 1;
		} else if (next >= images.length) {
			next = 0;
		}
		return next;
	};

	const handleNext = useCallback(() => {
		const nextSlide = getNextSlide(currentSlide, 1);
		setCurrentSlide(nextSlide);
		setTransition("0.5s ease-out");
	}, [ currentSlide ]);

	const handleDragStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setDragStart(event.clientX);
		setIsDragging(true);
		setTransition("none");
	};

	const handleDragMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (isDragging) {
			setDragEnd(event.clientX);
		}
	};

	const handleDragEnd = () => {
		if (isDragging) {
			const delta = dragEnd - dragStart;
			if (Math.abs(delta) > 100) {
				setCurrentSlide((prev) => getNextSlide(prev, delta > 0 ? -1 : 1));
			}
			setIsDragging(false);
			setDragStart(0);
			setDragEnd(0);
			setTransition("0.5s ease-out");
		}
	};

	useEffect(() => {
		timerRef.current = setInterval(() => {
			handleNext();
		}, duration);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [currentSlide, duration, handleNext]);

	const classNames = useStyles();
	return (
		<div
			className={classNames.outerContainer}
			onMouseDown={handleDragStart}
			onMouseMove={handleDragMove}
			onMouseUp={handleDragEnd}
			onMouseLeave={handleDragEnd}
		>
			<div
				ref={sliderRef}
				className={classNames.innerContainer}
				style={{
					width: `${images.length * 100}vw`,
					left: `-${currentSlide * 100}vw`,
					transition,
				}}
			>
				{images.map((image, index) => (
					<div
						key={index}
						style={{
							backgroundImage: `url(${image.url})`,
						}}
						className={classNames.carouselItem}
					>
						<div
							className={classNames.description}
						>
							<div style={{ fontSize: 40 }}>
								{image.title?.map(txt => (
									<p>{txt}</p>
								))}
							</div>
							<div style={{ fontSize: 25 }}>
								{image.description?.map(txt => (
									<p>{txt}</p>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
			<div
				className={classNames.indicatorWrapper}
			>
				{images.map((image, index) => (
					<div
						key={index}
						style={{
							backgroundColor: currentSlide === index ? "#fff" : "#6b6b6b",
							marginLeft: index === 0 ? 0 : "10px",
						}}
						className={classNames.indicatorItem}
					/>
				))}
			</div>
		</div>
	);
};

export default Carousel;