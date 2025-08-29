"use client";

export function Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">n8n</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
                Workflow Assistant
            </span>
        </div>
    );
}