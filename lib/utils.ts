import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isStringBlank(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim().length === 0;
}

export function isEmptyArray(value: unknown[] | null | undefined): boolean {
    return value === null || value === undefined || value.length === 0;
}

export const isTimestampForCurrentDay = (timestamp: number | null | undefined) => {
    if (timestamp === null || timestamp === undefined) return false
    const temp = new Date(timestamp)
    const today = new Date()

    return (
        (temp.getDate() === today.getDate()) &&
            (temp.getMonth() === today.getMonth() &&
                (temp.getFullYear() === today.getFullYear())
            )
    )
}

export const isTimestampWithinLastDays = (timestamp: number | null | undefined, days: number): boolean => {
    if (timestamp === null || timestamp === undefined) return false
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return timestamp >= cutoff
}

export const formatDateTime = (date: Date) => {
    const datePart = date.toLocaleDateString(undefined, {day: "numeric", month: "short", year: "numeric"});
    const timePart = date.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"});
    return `${datePart}, ${timePart}`;
}