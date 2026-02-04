import { useState, useEffect } from "react";

interface SaveButtonProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    type?: "button" | "submit" | "reset";
}

export default function SaveButton({
    id,
    children,
    className = "",
    type = "submit",
}: SaveButtonProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Listen for custom events to control loading state
        const handleLoadingStart = () => setLoading(true);
        const handleLoadingEnd = () => setLoading(false);

        window.addEventListener(`${id}-loading-start`, handleLoadingStart);
        window.addEventListener(`${id}-loading-end`, handleLoadingEnd);

        return () => {
            window.removeEventListener(`${id}-loading-start`, handleLoadingStart);
            window.removeEventListener(`${id}-loading-end`, handleLoadingEnd);
        };
    }, [id]);

    return (
        <button
            type={type}
            id={id}
            disabled={loading}
            className={`px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {loading ? "Saving..." : children}
        </button>
    );
}
