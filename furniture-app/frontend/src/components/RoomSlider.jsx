import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const images = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800"
];

export default function RoomSlider() {
  return (
    <Swiper spaceBetween={20} slidesPerView={1.2}>
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              borderRadius: 8
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}