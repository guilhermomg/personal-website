import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastMessage {
    message: string;
    type: "success" | "error";
}

export default function Toast({ id = "toast-container" }: { id?: string }) {
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Listen for custom events to show toast
        const handleShowToast = (
            event: CustomEvent<{ message: string; type: "success" | "error" }>,
        ) => {
            setToast({ message: event.detail.message, type: event.detail.type });
            setIsVisible(true);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                handleClose();
            }, 5000);
        };

        window.addEventListener("show-toast", handleShowToast as EventListener);

        return () => {
            window.removeEventListener(
                "show-toast",
                handleShowToast as EventListener,
            );
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to finish before clearing toast
        setTimeout(() => {
            setToast(null);
        }, 300);
    };

    if (!toast) return null;

    const bgColor =
        toast.type === "success"
            ? "bg-green-50 dark:bg-green-900/30 border-green-500"
            : "bg-red-50 dark:bg-red-900/30 border-red-500";
    const textColor =
        toast.type === "success"
            ? "text-green-700 dark:text-green-200"
            : "text-red-700 dark:text-red-200";
    const iconColor =
        toast.type === "success"
            ? "text-green-500 dark:text-green-400"
            : "text-red-500 dark:text-red-400";

    return (
        <div
            id={id}
            className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
                isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            }`}
        >
            <div
                className={`${bgColor} ${textColor} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md`}
            >
                <div className={iconColor}>
                    {toast.type === "success" ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                </div>
                <div className="flex-1 text-sm font-medium">{toast.message}</div>
                <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
