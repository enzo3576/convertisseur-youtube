import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

// Force Node.js environment for ytdl-core
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return new NextResponse("Missing or invalid video URL", { status: 400 });
    }

    try {
        // Get the title to construct a nice filename
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'youtube_short';

        // Stream the video (highest quality with both video and audio, usually up to 720p HD)
        const stream = ytdl(videoUrl, { filter: "audioandvideo", quality: "highest" });

        // Stream the readable data directly to Next Response natively
        const headers = new Headers();
        headers.set("Content-Disposition", `attachment; filename="${title}.mp4"`);
        headers.set("Content-Type", "video/mp4");

        // Convert the Node stream to a Web ReadableStream
        const readableStream = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk));
                stream.on("end", () => controller.close());
                stream.on("error", (err) => controller.error(err));
            },
        });

        return new NextResponse(readableStream, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Download proxy error:", error);
        return new NextResponse("Internal Server Error while downloading", { status: 500 });
    }
}
