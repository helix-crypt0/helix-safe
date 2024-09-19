import { IMultisig } from "@src/db/schema/multisig";
import { Types } from "mongoose";
import { Dispatch, SetStateAction } from "react";
import crypto from "crypto";

/**
 * Convert hexcode to rgba
 * @param hex - hex code of color
 * @param opacity - amnount of opacity to add
 * @returns string i.e. "rgba(244,0,0, 0.4)"
 */
export function hexToRgba(hex: string, opacity: number): string {
    // Remove the # symbol if it's present
    hex = hex.replace(/^#/, "");

    // Parse the hex value into red, green, and blue components
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Create the RGBA color string with the specified opacity
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    return rgba;
}

/**
 * get mongo document's id as a string
 * @param obj - mongo doc to get id from
 * @returns string
 */
export function getMongoStringId<T extends { _id?: Types.ObjectId }>(
    obj: T,
): string {
    return obj._id?.toString() || "";
}

/**
 * handle updating provided text
 * @param txtToCopy - text to copy
 * @param setCopied - state updater
 */
export const handleCopy = async (
    txtToCopy: string,
    setCopied: Dispatch<SetStateAction<boolean>>,
) => {
    try {
        await navigator.clipboard.writeText(txtToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Show "Copied" for 2 seconds
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
};

export const handleTooltipCopy = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    address: string,
    setTooltipText: Dispatch<SetStateAction<string>>,
) => {
    e.stopPropagation(); // stops the click event from bubbling up to the parent element
    navigator.clipboard.writeText(address);
    setTooltipText("copied!");
    setTimeout(() => {
        setTooltipText("");
    }, 2000);
};

/**
 * open up new tab to provided website
 * @param href - site to navigate to
 */
export const navigateToSite = (href: string) => {
    window.open(href, "_blank");
};

export const getColorFromSuiAddress = (address: string): string => {
    // Hash the address using SHA-256
    const hash = crypto.createHash("sha256").update(address).digest("hex");

    // Extract the first 6 characters of the hash to form an RGB color
    const r = parseInt(hash.slice(0, 2), 16); // Red
    const g = parseInt(hash.slice(2, 4), 16); // Green
    const b = parseInt(hash.slice(4, 6), 16); // Blue

    // Return the color in hex format
    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
