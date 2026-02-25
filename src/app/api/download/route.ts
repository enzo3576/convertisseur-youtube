import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
        return new NextResponse("Missing video URL", { status: 400 });
    }

    try {
        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        // Pass the response body directly to stream it to the client
        // and force the download with Content-Disposition
        const headers = new Headers(response.headers);
        headers.set("Content-Disposition", `attachment; filename="youtube_short.mp4"`);

        // Ensure we handle missing content-type
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "video/mp4");
        }

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Download proxy error:", error);
        return new NextResponse("Internal Server Error while downloading", { status: 500 });
    }
}
