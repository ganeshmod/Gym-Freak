"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Slider from "react-slick";
import Image from "next/image";

const Hero = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    cssEase: "linear",
    arrows: false,
  };

  const images = [
    "/png/hero-img-1.png",
    "/png/Hero.jpg",
    "/png/supplement2-hero.png",
    // "/png/clothing-hero.png",
  ];

  return (
    <div className="w-full bg-black">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div
            key={index}
            className="relative w-full h-[40vh] sm:h-[55vh] md:h-[65vh] lg:h-[75vh]"
          >
            <Image
              src={src}
              alt={`Hero Slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Hero;
