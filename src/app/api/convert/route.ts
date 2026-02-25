import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "L'URL est requise" }, { status: 400 });
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            return NextResponse.json({ error: "URL YouTube Invalide" }, { status: 400 });
        }

        const apiKey = process.env.RAPIDAPI_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: "Défaut de configuration : la variable RAPIDAPI_KEY est manquante."
            }, { status: 500 });
        }

        // Appel à la nouvelle API "Youtube Download/Search" par YThelper (500/mois)
        const fetchRes = await fetch(`https://youtube-download-search.p.rapidapi.com/dl?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'youtube-download-search.p.rapidapi.com'
            }
        });

        let data;
        try {
            data = await fetchRes.json();
        } catch (e) {
            data = { text: await fetchRes.text() };
        }

        if (!fetchRes.ok || !data) {
            console.error("New RapidAPI Error Details:", data);
            throw new Error(`Erreur RapidAPI : ` + JSON.stringify(data));
        }

        // This specific API returns the format list under data.formats
        const formats = data.formats || [];

        // On cherche le meilleur flux vidéo en mp4 avec le son
        const mp4Videos = formats.filter((v: any) => v.ext === 'mp4' && v.acodec !== 'none' && v.vcodec !== 'none');

        // Préférence pour la meilleure qualité (souvent 720p ou 1080p ont le son compressé ensemble sur cette API)
        const preferredQualities = ["1080p", "720p", "480p", "360p"];
        let bestVideo = null;

        for (const quality of preferredQualities) {
            const found = mp4Videos.find((v: any) => v.format_note === quality);
            if (found) {
                bestVideo = found;
                break;
            }
        }

        // Si on ne trouve pas de mp4 explicite avec le bon 'format_note', on prend le premier qui a au moins url + ext=mp4
        if (!bestVideo) {
            const fallback = formats.filter((v: any) => v.ext === 'mp4' && v.url);
            bestVideo = fallback.length > 0 ? fallback[0] : null;
        }

        if (!bestVideo || !bestVideo.url) {
            throw new Error("Aucun lien de téléchargement MP4 n'a été trouvé pour cette vidéo.");
        }

        return NextResponse.json({
            success: true,
            message: "Traitement terminé",
            videoData: {
                title: data.title || "Youtube_Video",
                format: "mp4",
                resolution: bestVideo.format_note || "1080p",
                codec: "H.264",
                watermark: false,
                downloadUrl: bestVideo.url
            }
        });

    } catch (error: any) {
        console.error("Erreur de conversion:", error);
        return NextResponse.json(
            { error: "Erreur serveur : " + (error.message || "impossible de contacter l'API") },
            { status: 500 }
        );
    }
}
