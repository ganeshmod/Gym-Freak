import React from 'react';

const GymCategories = () => {
    const categories = [
        {
            id: 'strength',
            title: 'STRENGTH',
            subtitle: 'Build Power',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
            icon: '💪'
        },
        {
            id: 'cardio',
            title: 'CARDIO',
            subtitle: 'Boost Endurance',
            image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=500&fit=crop',
            icon: '🏃'
        },
        {
            id: 'crossfit',
            title: 'CROSSFIT',
            subtitle: 'Total Body',
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop',
            icon: '🔥'
        },
        {
            id: 'yoga',
            title: 'YOGA',
            subtitle: 'Mind & Body',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
            icon: '🧘'
        }
    ];

    return (
        <div className="app-bg">
            {/* Hero Section */}
            <div className="relative overflow-hidden py-8 px-8 app-bg">

                <div className="relative z-10 mx-1 md:mx-16 ">
                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                className="group cursor-pointer "
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative overflow-hidden bg-zinc-800 rounded-md transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                    {/* Image Container */}
                                    <div className="relative aspect-3/4 overflow-hidden">
                                        <img
                                            src={category.image}
                                            alt={category.title}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>

                                        {/* Icon */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-125">
                                            {category.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative p-6 bg-[#5d5d5d]">
                                        {/* Diagonal Cut */}
                                        <div className="absolute -top-6 left-0 right-0 h-6 bg-[#5d5d5d]" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}></div>

                                        <div className="text-center">
                                            <h3 className="text-2xl font-black tracking-widest mb-2 uppercase transition-colors duration-300" style={{ color: '#c4c4c4' }}>
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-medium mb-4">{category.subtitle}</p>

                                            {/* Animated Underline */}
                                            <div className="h-1 w-0 group-hover:w-full transition-all duration-500 mx-auto mb-4" style={{ backgroundColor: '#c4c4c4' }}></div>

                                            {/* Button */}
                                            <button className="w-full py-3 px-6 font-bold text-sm tracking-wider uppercase border-2 transition-all duration-300 group-hover:bg-opacity-100" style={{
                                                backgroundColor: 'transparent',
                                                borderColor: '#c4c4c4',
                                                color: '#c4c4c4'
                                            }}>
                                                <span className="group-hover:tracking-widest transition-all duration-300">
                                                    START NOW →
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `0 0 40px rgba(196, 196, 196, 0.3)` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default GymCategories;   