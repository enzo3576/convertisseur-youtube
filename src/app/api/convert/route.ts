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

        // Vérification de la clé d'API
        const apiKey = process.env.RAPIDAPI_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: "Défaut de configuration : la variable RAPIDAPI_KEY est manquante sur Vercel."
            }, { status: 500 });
        }

        // Extraction de l'ID Youtube (ex: wkTxZt2cKQg)
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=))([\w-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return NextResponse.json({ error: "Impossible de comprendre l'URL ou de trouver l'ID de la vidéo" }, { status: 400 });
        }

        // Appel à l'API "YouTube Media Downloader" sur RapidAPI
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
            }
        };

        const fetchRes = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, options);
        let data;
        try {
            data = await fetchRes.json();
        } catch (e) {
            data = { text: await fetchRes.text() };
        }

        if (!fetchRes.ok) {
            console.error("RapidAPI Error Details:", data);
            throw new Error(`Erreur RapidAPI [${fetchRes.status}] : ` + JSON.stringify(data));
        }

        // On cherche le meilleur flux vidéo en mp4
        const videos = data.videos?.items || [];
        const mp4Videos = videos.filter((v: any) => v.extension === 'mp4' || v.extension === 'mp4a');

        // Préférence pour la meilleure qualité avec audio et vidéo fusionnés.
        // Typiquement "1080p" n'a pas toujours le son natif, mais "720p" l'a par défaut.
        // Si hd1080 existe en complet, on le prend sinon on descend jusqu'à trouver.
        const preferredQualities = ["1080p", "hd1080", "1080", "720p", "hd720", "720", "480p", "large", "360p", "medium"];
        let bestVideo = null;

        for (const quality of preferredQualities) {
            const found = mp4Videos.find((v: any) => v.quality === quality);
            if (found) {
                bestVideo = found;
                break;
            }
        }

        // Si aucune qualité correspondante n'a été trouvée, on prend la meilleure par défaut (soit le premier élément de la liste, souvent le meileur ou au moins un mp4)
        if (!bestVideo) {
            bestVideo = mp4Videos[0] || videos[0];
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
                resolution: bestVideo.quality || "1080p",
                codec: "H.264",
                watermark: false,
                // On passe le lien final vers lequel notre proxy `api/download` va forcer le téléchargement
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
