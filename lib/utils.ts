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
