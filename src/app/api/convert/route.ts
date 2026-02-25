import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
        }

        // Fetch video information
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;

        return NextResponse.json({
            success: true,
            message: "Processing started",
            videoData: {
                title: videoDetails.title,
                format: "mp4",
                resolution: "HD", // Typically 720p or 1080p source depending on the native merged format
                codec: "H.264",
                watermark: false,
                // We pass the ORIGINAL youtube url back so the download proxy can stream it
                downloadUrl: url
            }
        });

    } catch (error: any) {
        console.error("Conversion error:", error);
        return NextResponse.json(
            { error: "Internal server error during conversion. Ensure the video is public." },
            { status: 500 }
        );
    }
}
