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

        // Extraction de l'ID Youtube (ex: wkTxZt2cKQg)
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=))([\w-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return NextResponse.json({ error: "Impossible de comprendre l'URL ou de trouver l'ID de la vidéo" }, { status: 400 });
        }

        // Appel à la nouvelle API "YT-API" (300 requêtes gratuites/mois)
        // Endpoint correct pour télécharger des vidéos via cette API : https://yt-api.p.rapidapi.com/dl?id=ID
        const fetchRes = await fetch(`https://yt-api.p.rapidapi.com/dl?id=${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'yt-api.p.rapidapi.com'
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

        // YT-API renvoie les liens de téléchargement sous `data.formats`
        const formats = data.formats || [];

        // On cherche un format MP4 qui contient les deux (Audio + Vidéo en un seul fichier)
        // Dans YT-API, 'acodec' n'est pas "none" et 'vcodec' n'est pas "none" pour les fichiers combinés
        const combinedMp4Videos = formats.filter((v: any) => v.ext === 'mp4' && v.acodec !== 'none' && v.vcodec !== 'none');

        // Préférence pour la meilleure qualité 
        const preferredQualities = ["1080p", "720p", "480p", "360p"];
        let bestVideo = null;

        for (const quality of preferredQualities) {
            // YT-API stocke parfois la résolution dans 'format_note' ou direct dans 'resolution'
            const found = combinedMp4Videos.find((v: any) =>
                v.format_note === quality ||
                (v.resolution && v.resolution.includes(quality.replace('p', '')))
            );
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
