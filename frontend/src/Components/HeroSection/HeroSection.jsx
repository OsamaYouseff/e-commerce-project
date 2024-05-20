import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTheme } from '@emotion/react';
import './Swiper.css';
import { ColorModeContext } from "../../Theme/theme";

import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import Features from './Features';


const bannerImagesData = [
  { gender: "men", discount: "30", src: "src/images/banner-15.jpg" },
  { gender: "women", discount: "50", src: "src/images/banner-25.jpg" },
  { gender: "men", discount: "30", src: "src/images/banner-15.jpg" },
  { gender: "women", discount: "50", src: "src/images/banner-25.jpg" }
]

const HeroSection = () => {
  const theme = useTheme(ColorModeContext);
  return (
    <Box sx={{ mt: "15px", bgcolor: theme.palette.sectionBgColor.main, py: 2 }} >
      <Container maxWidth="xl" >
        <Stack direction={"row"} gap={1} sx={{ borderRadius: "10px", overflow: "hidden", boxShadow: 4 }} >
          <SwiperComponent />
          {/* xl: {  } */}
          <Box className="parent-box" minWidth="26.8%" sx={{
            [theme.breakpoints.up('md')]: {
              display: "flex", justifyContent: "space-between", flexDirection: "column"
            },
            [theme.breakpoints.down('md')]: {
              display: "none"
            },
          }}>
            <div className="img-container " style={{ display: "flex", position: "relative" }}>
              <img style={{ minWidth: "100%", maxWidth: "100%" }} src="src/images/banner-17.jpg" alt="banner-img" />
              <Typography className='sub-banner-text '
                sx={{

                  position: "absolute", top: "25%", left: "9%", color: "#222", textAlign: "left", textTransform: "capitalize",
                }}>
                < Typography sx={{ textTransform: "uppercase", fontSize: "18px", fontWeight: "bold" }}> new arrivals</Typography>
                <Typography sx={{ textTransform: "uppercase", fontSize: "18px" }}> summer</Typography>
                <Typography
                  sx={{
                    display: "flex", alignItems: "center", textTransform: "uppercase", fontSize: "18px", fontWeight: "bold"
                  }}>
                  sale up to
                  <Typography
                    sx={{ textTransform: "uppercase", fontSize: "20px", marginLeft: "10px", fontWeight: "bold", color: "#ff4450" }}>
                    20% off
                  </Typography>

                </Typography>
                <Button sx={{ border: "none", p: 0, fontSize: "14px", "&:hover": { color: "red" } }} color='inherit' >Shop now <ArrowRightAltIcon /> </Button>
              </Typography>
            </div>
            <div className="img-container " style={{ display: "flex", position: "relative" }}>
              <img style={{ minWidth: "100%", maxWidth: "100%" }} src="src/images/banner-16.jpg" alt="banner-img" />
              <Typography className='sub-banner-text '
                sx={{

                  position: "absolute", top: "25%", left: "9%", color: "#222", textAlign: "left", textTransform: "capitalize",
                }}>
                < Typography sx={{ textTransform: "uppercase", fontSize: "22px", fontWeight: "bold" }}> Gaming 4k</Typography>
                <Typography sx={{ textTransform: "uppercase", fontSize: "16px", fontWeight: "bold", my: .5 }}> Desktops & </Typography>
                <Typography
                  sx={{
                    display: "flex", alignItems: "center", textTransform: "uppercase", fontSize: "16px", fontWeight: "bold"
                  }}>
                  Laptops
                </Typography>
                <Button sx={{ border: "none", p: 0, fontSize: "14px", "&:hover": { color: "purple" } }} color='inherit' >Shop now <ArrowRightAltIcon /> </Button>
              </Typography>
            </div>
          </Box>
        </Stack>
        <Features />
      </Container>
    </Box >
  );
};

function SwiperComponent() {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty('--progress', 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };
  const theme = useTheme();

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
              <Stack className='banner-text ' direction={"column"} sx={{
                position: "absolute", top: "15%", left: "9%", color: "#222", textAlign: "left", textTransform: "capitalize", fontSize: "18px",
              }}>
                <Typography sx={{
                  display: "flex", flexDirection: "column",
                  [theme.breakpoints.up('sm')]: {
                    gap: "15px",
                  },
                }}>
                  < Typography sx={{ textTransform: "uppercase", fontSize: "35px", fontWeight: "bold" }}> Life style collection</Typography>
                  <Typography sx={{ textTransform: "uppercase", fontSize: "50px" }}> {item.gender}</Typography>
                  <Typography
                    sx={{
                      display: "flex", alignItems: "center", gap: "10px", textTransform: "uppercase", fontSize: "35px", fontWeight: "bold",
                      [theme.breakpoints.down('sm')]: {
                        justifyContent: "center !important",
                      },
                    }}>
                    sale up to
                    <Typography
                      sx={{ textTransform: "uppercase", fontSize: "40px", marginLeft: "10px", fontWeight: "bold", color: "#cf4e56" }}>
                      {item.discount}% off
                    </Typography>

                  </Typography>
                  get free shipping on orders over $99.99
                </Typography>
                <Button color='secondary'
                  sx={{
                    mt: "25px",
                    color: theme.palette.bgColor.main,
                    bgcolor: theme.palette.bgColor2.main,
                    border: "1px solid",
                    "&: hover": {
                      color: theme.palette.bgColor2.main,
                      borderColor: theme.palette.bgColor2.main,
                      bgcolor: theme.palette.bgColor.main,
                    }
                  }}>Shop now</Button>
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

export default HeroSection;