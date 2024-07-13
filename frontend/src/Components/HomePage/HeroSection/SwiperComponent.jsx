import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Button, Stack, Typography } from "@mui/material";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTheme } from '@emotion/react';
import './Swiper.css';

const bannerImagesData = [
	{ gender: "men", discount: "30", src: "./images/banner-15.jpg" },
	{ gender: "women", discount: "50", src: "./images/banner-25.jpg" },
	{ gender: "men", discount: "30", src: "./images/banner-15.jpg" },
	{ gender: "women", discount: "50", src: "./images/banner-25.jpg" }
]

const SwiperComponent = () => {
	const progressCircle = useRef(null);
	const progressContent = useRef(null);
	const onAutoplayTimeLeft = (s, time, progress) => {
		progressCircle.current.style.setProperty('--progress', 1 - progress);
		progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
	};
	const theme = useTheme();
	const AdjustFontWithClamp = (min, max) => {
		return `clamp(${min}px,calc(${min}px + (${max} - ${min}) * (100vw - 350px) / (1920 - 350)),${max}px) !important`
	}

	return (
		<Swiper
			slidesPerView={1}
			centeredSlides={true}
			spaceBetween={30}
			loop={true}
			pagination={{
				clickable: true,
			}}
			autoplay={{
				delay: 4500,
				disableOnInteraction: false,
			}}
			navigation={true}
			modules={[Autoplay, Pagination, Navigation]}
			onAutoplayTimeLeft={onAutoplayTimeLeft}
			className="mySwiper"
		>
			{
				bannerImagesData.map((item, index) => {
					return (
						<SwiperSlide key={index} sx={{ position: "relative" }}>
							<img className='banner-img' src={item.src} alt="banner-img" />
							<Stack className='banner-text' direction={"column"}
								sx={{
									width: {
										xs: "70%",
										sm: "60%",
										xl: "50%",
									},
									position: "absolute",
									top: "0%",
									left: "9%",
									color: "#222",
									textAlign: "left",
									textTransform: "capitalize",
									fontSize: "18px",
									minHeight: "100%",
									display: "flex",
									justifyContent: "center",
									gap: "10px",
									[theme.breakpoints.up('sm')]: {
										gap: "20px",
									},
								}}>
								<Typography className="banner-text-child" sx={{
									display: "flex", flexDirection: "column",
									[theme.breakpoints.up('sm')]: {
										gap: "15px",
									},
								}}>
									<Typography className="banner-text-child" sx={{ textTransform: "uppercase", fontSize: AdjustFontWithClamp(17, 50), fontWeight: "bold" }}> Life style collection</Typography>
									<Typography className="banner-text-child" sx={{ textTransform: "uppercase", fontSize: AdjustFontWithClamp(20, 50) }}> {item.gender}</Typography>
									<Typography className="banner-text-child"
										sx={{
											display: "flex",
											alignItems: "center",
											gap: "2px",
											textTransform: "uppercase",
											fontSize: AdjustFontWithClamp(20, 50),
											fontWeight: "bold",
											[theme.breakpoints.down('sm')]: {
												justifyContent: "center !important",
											},
										}}>
										sale up to
										<Typography className="banner-text-child"
											sx={{ textTransform: "uppercase", fontSize: AdjustFontWithClamp(20, 50), marginLeft: "10px", fontWeight: "bold", color: "#cf4e56" }}>
											{item.discount}% off
										</Typography>

									</Typography> get free shipping on orders over $99.99 </Typography>
								<Button color='secondary'
									sx={{
										width: "50%",
										mt: { sm: "20px", xs: "0px" },
										maxHeight: AdjustFontWithClamp(25, 50),
										fontSize: AdjustFontWithClamp(10, 22),
										color: theme.palette.bgColor.main,
										bgcolor: theme.palette.bgColor2.main,
										border: "1px solid",
										"&: hover": {
											color: theme.palette.bgColor2.main,
											borderColor: theme.palette.bgColor2.main,
											bgcolor: theme.palette.bgColor.main,
										}
									}}
								>Shop now
								</Button>
							</Stack >
						</SwiperSlide >
					)
				})
			}
			< div className="autoplay-progress" style={{ display: "none" }
			} slot="container-end" >
				<svg viewBox="0 0 48 48" ref={progressCircle}>
					<circle cx="24" cy="24" r="20"></circle>
				</svg>
				<span ref={progressContent}></span>
			</div >
		</Swiper >
	)
}


export default SwiperComponent