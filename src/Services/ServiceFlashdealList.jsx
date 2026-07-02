import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const services = [
    {
        id: 1,
        title: "Hair Cutting & Styling",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 5,
        reviews: 95,
    },
    {
        id: 2,
        title: "Beauty & Facial Treatment",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 4,
        reviews: 120,
    },
    {
        id: 3,
        title: "Massage & Spa Therapy",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 5,
        reviews: 78,
    },
    {
        id: 4,
        title: "Nail Care & Manicure",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 4,
        reviews: 62,
    },
    {
        id: 5,
        title: "Barber Services & Shave",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 5,
        reviews: 105,
    },
    {
        id: 6,
        title: "Waxing & Hair Removal",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 4,
        reviews: 50,
    },
    {
        id: 7,
        title: "Bridal Makeup Services",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 5,
        reviews: 30,
    },
    {
        id: 8,
        title: "Eyelash Extension",
        route: "/servicedetail",
        img: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max",
        rating: 4,
        reviews: 45,
    },
];

const StarRating = ({ rating }) => (
    <span className="text-yellow-500 flex items-center">
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={i < rating ? "currentColor" : "none"}
                    stroke={i < rating ? "none" : "currentColor"}
                    strokeWidth="1.5"
                    className="w-3 h-3"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.868 2.884c.325-.795 1.48-.795 1.805 0l1.931 4.707 5.176.425c.801.066 1.129 1.055.518 1.574l-3.922 3.23.957 5.063c.15.795-.658 1.455-1.378 1.014L10 16.03l-4.717 2.842c-.72.441-1.528-.219-1.378-1.014l.957-5.063-3.922-3.23c-.611-.519-.283-1.508.518-1.574l5.176-.425 1.931-4.707z"
                        clipRule="evenodd"
                    />
                </svg>
            ))}
    </span>
);

const ServiceCard = ({ service }) => (
    <Link
        to={service.route}
        className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition relative hover:border-blue-600 hover:scale-[1.01] duration-200 cursor-pointer border border-transparent"
    >
        
        <div className="h-36 flex items-center justify-center overflow-hidden mb-3 relative z-10">
            <img
                src={service.img}
                alt={service.title}
                className="object-cover h-full w-full rounded-md transition-transform" 
            />
        </div>

        <h4 className="text-lg font-bold text-gray-900 truncate relative z-10 mb-1">
            {service.title}
        </h4>

        {service.rating > 0 && (
            <div className="flex items-center mt-1 mb-3 relative z-10">
                <StarRating rating={service.rating} />
                <span className="text-sm text-gray-500 ml-2">({service.reviews} Bookings)</span>
            </div>
        )}
        
        <span className="mt-auto block w-full py-2 text-center text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition relative z-10">
            View Details
        </span>
    </Link>
);


export default function ServiceListLayout() {
    const [timeLeft, setTimeLeft] = useState({
        days: 827,
        hours: 0,
        minutes: 26,
        seconds: 35,
    });
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) seconds -= 1;
                else if (minutes > 0) { minutes -= 1; seconds = 59; }
                else if (hours > 0) { hours -= 1; minutes = 59; seconds = 59; }
                else if (days > 0) { days -= 1; hours = 23; minutes = 59; seconds = 59; }
                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen font-inter">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="relative bg-blue-100 p-6 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center border border-blue-200 shadow-md">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800">PREMIUM SERVICE DEALS</h2>
                        <p className="text-sm text-gray-600">
                            Book your next beauty appointment now and save big!
                        </p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg px-6 py-3 flex gap-4 mt-4 md:mt-0 shadow-lg">
                        {Object.entries(timeLeft).map(([key, value]) => (
                            <div key={key} className="text-center">
                                <div className="text-xl font-extrabold">
                                    {value.toString().padStart(2, "0")}
                                </div>
                                <div className="text-[10px] uppercase">{key}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1">
                    <div className="col-span-1">
                        
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Saloon & Beauty Services</h3>
                            <div className="text-sm font-medium text-gray-600">
                                {services.length} Services Found
                            </div>
                        </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}