import React from 'react'
import Image from 'next/image'
import UpperFooter from './upperFooter'
import { Instagram, Facebook, Linkedin, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
    return (
        <>
            <UpperFooter />
            <footer className="app-bg text-gray-700 py-12 px-6">
                <div className="max-w-[1700px] mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">

                    {/* Left Section - Logo */}
                    <div className="flex flex-col items-start gap-6">
                        <div className="font-black tracking-wider">
                           <Image src="/svg/GymfreakLogoBlackNoBg.svg" alt=""width={250} height={30} />
                        </div>

                            {/* Social Media Icons */}
                            <div className="flex gap-4">
                                {[
                                    { icon: <Instagram size={18} />, href: "#" },
                                    { icon: <Facebook size={18} />, href: "#" },
                                    { icon: <Linkedin size={18} />, href: "#" },
                                    { icon: <Twitter size={18} />, href: "#" },
                                    { icon: <MessageCircle size={18} />, href: "#" },
                                ].map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.href}
                                        className="w-9 h-9 flex items-center justify-center border border-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                                    >
                                        {item.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Middle Section - Navigation Links */}
                        <div className="flex flex-col items-start gap-4">
                            <h3 className="text-sm font-instrument">FOOTER</h3>
                            <nav className="flex flex-col gap-2 text-sm">
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">Exchange Portal</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">GENRAGE Reviews</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">Exchange Policy</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">Policies</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">About us</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito">Terms of Service</a>
                                <a href="#" className="hover:text-gray-900 transition-colors font-nunito ">PARTNER WITH US</a>
                            </nav>
                        </div>

                        {/* Right Section - Branding */}
                        <div className="flex flex-col items-end gap-2">
                            <p className="text-sm font-instrument">PROUDLY HOMEGROWN IN INDIA</p>
                            <p className="text-sm font-nunito">© GYMFREAK</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}