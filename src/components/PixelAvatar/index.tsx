import React, { useEffect, useRef, useState } from "react";
import crypto from "crypto"; // To use node crypto in your React app
import Avatar from "@mui/material/Avatar";
interface Props {
    address: string;
    size?: number;
}
const PixelAvatar: React.FC<Props> = ({ address, size = 40 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        const hash = crypto.createHash("sha256").update(address).digest("hex");
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const pixelSize = 8; // 8x8 pixel grid
        const scale = size / pixelSize; // Scale each pixel to fit the avatar size

        if (!ctx) return;
        canvas.width = pixelSize;
        canvas.height = pixelSize;

        for (let y = 0; y < pixelSize; y++) {
            for (let x = 0; x < pixelSize; x++) {
                const i = (y * pixelSize + x) * 3; // 3 hex characters for each RGB component
                const color = `#${hash.slice(i, i + 6)}`;
                ctx.fillStyle = color;

                // Draw a symmetrical pattern
                ctx.fillRect(x * scale, y * scale, scale, scale);
                ctx.fillRect(
                    (pixelSize - x - 1) * scale,
                    y * scale,
                    scale,
                    scale,
                );
            }
        }

        // Convert the canvas to a data URL and set it as the image source
        const dataUrl = canvas.toDataURL();
        setImageSrc(dataUrl);
    }, [address, size]);

    return (
        <>
            <canvas ref={canvasRef} style={{ display: "none" }} />{" "}
            {/* Hidden canvas */}
            <Avatar src={imageSrc} sx={{ width: size, height: size }} />
        </>
    );
};

export default PixelAvatar;
