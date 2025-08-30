"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";
import Image from "next/image";
import { getCalApi } from "@calcom/embed-react";

export function ProfileHeader() {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ "namespace": "30min" });
            cal("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, []);

    const handleBookSession = () => {
        // Trigger Cal.com booking popup
        const calButton = document.querySelector('[data-cal-namespace="30min"]') as HTMLElement;
        if (calButton) {
            calButton.click();
        }
    };

    return (
        <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    {/* Profile Picture */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className={`
                            relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                            rounded-full overflow-hidden border-3 border-gradient-to-r 
                            from-blue-500 to-purple-500 p-0.5 transition-all duration-300
                            ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
                        `}>
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                                <Image
                                    src="/profile.jpeg"
                                    alt="Profile"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Animated ring */}
                        <div className={`
                            absolute inset-0 rounded-full border-2 border-blue-400 
                            transition-all duration-500 ${isHovered ? 'scale-125 opacity-0' : 'scale-100 opacity-0'}
                        `} />
                    </div>

                    {/* Hire Me Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <div className="text-center sm:text-left">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Hire Me
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                                AI Agent I n8n I Automation
                            </p>
                        </div>

                        {/* Contact Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleBookSession}
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                            >
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Book AI Session</span>
                                <span className="sm:hidden">Book AI Session</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open("tel:+254708235245", "_self")}
                                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700"
                            >
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="ml-1 sm:ml-2 hidden md:inline">Call</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile subtitle */}
                <div className="text-center mt-2 sm:hidden">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI Agent I n8n I Automation
                    </p>
                </div>

                {/* Hidden Cal.com trigger button */}
                <button
                    data-cal-namespace="30min"
                    data-cal-link="hammton-ndeke-f0du2x/30min"
                    data-cal-config='{"layout":"month_view"}'
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}