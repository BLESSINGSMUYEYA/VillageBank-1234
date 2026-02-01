"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectionErrorProps {
    message?: string;
}

export function ConnectionError({ message }: ConnectionErrorProps) {
    const router = useRouter();

    return (
        <EmptyState
            icon={WifiOff}
            title="Connection Error"
            description={message || "Could not connect to the database. Please check your internet connection or try again later."}
            actionLabel="Try Again"
            onAction={() => {
                router.refresh();
            }}
        />
    );
}
