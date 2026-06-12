"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/globalStore";
import { genericGetApi, genericPostApi } from "../admin/api-helper-admin";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { useToast } from "./customToastProvider";
import { clearGuestCart, getGuestCart } from "@/lib/guestCart";
import SearchOverlay from "../(main)/components/searchOverlay";

const Navbar = () => {
  const { success } = useToast();
  const router = useRouter();
  const navRefs = useRef([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const detailsRef = useRef(null);

  const setUserDetails = useGlobalStore((state) => state.setUserDetails);
  const userDetails = useGlobalStore((state) => state.userDetails);
  const cartCount = useGlobalStore((state) => state.cartCount);
  const setCartCount = useGlobalStore((state) => state.setCartCount);

  console.log("userDetails", userDetails);

  useEffect(() => {
    gsap.fromTo(
      navRefs.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }
    );
  }, []);

  const navItems = [
    { id: 1, name: "NEW ARRIVALS", link: "/collections/new-arrivals" },
    { id: 2, name: "T-SHIRTS", link: "/collections/t-shirts" },
    { id: 3, name: "PROTEINS", link: "/collections/proteins" },
    { id: 4, name: "CLEARANCE", link: "/collections/clearance" },
    { id: 5, name: "COLLECTIONS", link: "/collections" },
  ];

  const handleMouseEnter = (el) => {
    gsap.to(el.querySelector(".underline"), {
      scaleX: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (el) => {
    gsap.to(el.querySelector(".underline"), {
      scaleX: 0,
      duration: 0.3,
      ease: "power2.in",
    });
  };

  const fetchUser = async () => {
    try {
      if (userDetails) return;
      const response = await genericGetApi("/api/user/fetchUser");
      if (response.success) {
        const user = response?.data || null;
        setUserDetails(user);
      } else {
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const userId = userDetails?._id;

      if (userId) {
        const data = await genericGetApi(`/api/cart/items?userId=${userId}`);
        if (data && data.success) {
          const items = data?.data?.items || [];
          const count = items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } else {
        const guestCart = getGuestCart();
        const count = guestCart.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  const logoutUser = async () => {
    try {
      const response = await genericPostApi("/api/auth/logout");
      if (response.success) {
        setUserDetails(null);
        const guestCart = getGuestCart();
        const guestCartCount = guestCart.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
        setCartCount(guestCartCount);
        success("User Logged Out Successfully");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userDetails?._id) {
      fetchCartCount();
    } else {
      const guestCart = getGuestCart();
      const count = guestCart.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
      setCartCount(count);
    }
  }, [userDetails]);

  return (
    <div className="sticky top-0 left-0 app-black w-full overflow-x-hidden px-3 sm:px-3 md:px-6 py-3 md:py-4 flex justify-between items-center text-white z-50 box-border">
      <div
        className="logo cursor-pointer shrink-0"
        onClick={() => router.push("/")}
      >
        <Image
          src="/svg/GymfreakLogo2.svg"
          width={120}
          height={120}
          alt="gymfreakLogo"
          className="w-24 sm:w-32 md:w-48 h-auto max-w-[140px] sm:max-w-[200px]"
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden sm:block">
        <ul className="flex cursor-pointer gap-2 lg:gap-8">
          {navItems?.map((item, index) => (
            <li
              onClick={() => router.push(item?.link)}
              className="relative opacity-0 text-[12px] sm:text-[11px] md:text-[12px] lg:text-[16px] font-instrument"
              key={item?.id}
              ref={(el) => (navRefs.current[index] = el)}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
              onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
            >
              {item?.name}
                <span className="underline absolute left-0 -bottom-1 w-full h-[2px] bg-white origin-left scale-x-0" />
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] left-0 w-full  bg-black/95 backdrop-blur-sm flex flex-col items-stretch gap-1 p-6 z-50 sm:hidden overflow-y-auto">
          {userDetails && (
            <details ref={detailsRef} className=" border-white/20  group">
              <summary className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200 list-none">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="/svg/account.svg"
                    alt="User"
                    className="bg-zinc-700 p-1"
                  />
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {userDetails?.name} {userDetails?.lastName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {userDetails?.email}
                  </div>
                </div>

                {/* 👇 The chevron rotates when <details> is open */}
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
              </summary>

              <div className="mt-2 ml-4 space-y-1">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    router.push("/user-profile");
                  }}
                  className="w-full text-left py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    router.push("/orders");
                  }}
                  className="w-full text-left py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  My orders
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logoutUser();
                  }}
                  className="w-full text-left py-3 px-4 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  Sign out
                </button>
              </div>
            </details>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                closeMobileMenu();
                router.push(item.link);
              }}
              className="w-full text-left text-base py-4 px-4 text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-instrument tracking-wide"
            >
              {item.name}
            </button>
          ))}

          {!userDetails && (
            <button
              onClick={() => {
                closeMobileMenu();
                router.push("/user-profile");
              }}
              className="flex items-center gap-3 mt-4 py-4 px-4 border-t border-white/20 pt-6 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/svg/account.svg" alt="User" />
              </Avatar>
              <span className="text-base font-medium">Sign in / Register</span>
            </button>
          )}
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Desktop Profile Dropdown */}
        <div className="hidden sm:block">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Avatar
                  className="h-6 w-6 cursor-pointer"
                  onClick={() =>
                    !userDetails ? router.push("/user-profile") : null
                  }
                >
                  <AvatarImage src="/svg/account.svg" alt="User" />
                </Avatar>
                {userDetails ? (
                  menuOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-300" />
                  )
                ) : null}
              </button>
            </DropdownMenuTrigger>

            {userDetails && (
              <DropdownMenuContent
                align="end"
                alignOffset={-20}
                className="w-56 text-black"
              >
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/svg/account.svg"
                      alt="User"
                      className={"bg-zinc-700 p-1"}
                    />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium truncate">
                    {userDetails?.name} {userDetails?.lastName}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/user-profile")}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/orders")}
                >
                  My Orders
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-red-500"
                  onClick={() => logoutUser()}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        {/* Search */}
        <Image
          src="/svg/search.svg"
          width={24}
          height={24}
          alt="search-icon"
          className="cursor-pointer hover:opacity-80 transition-opacity w-5 h-5 sm:w-6 sm:h-6"
          onClick={() => setSearchOpen(true)}
        />

        {/* Cart */}
        <div
          onClick={() => router.push("/cart")}
          className="cursor-pointer relative hover:opacity-80 transition-opacity"
        >
          <Image
            src="/svg/cart.svg"
            width={24}
            height={24}
            alt="cart-icon"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[16px]">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden flex justify-center items-center w-9 h-9 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          type="button"
        >
          {mobileMenuOpen ? (
            <X
              size={24}
              strokeWidth={2}
              className="transition-transform duration-200"
            />
          ) : (
            <Menu
              size={24}
              strokeWidth={2}
              className="transition-transform duration-200"
            />
          )}
        </button>
      </div>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Navbar;
