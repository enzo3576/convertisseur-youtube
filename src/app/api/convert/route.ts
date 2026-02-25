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

        // YT-API renvoie les flux combinés (audio+vidéo) sous `data.formats`
        const formats = data.formats || [];

        // On cherche un format MP4 qui contient les deux (Audio + Vidéo en un seul fichier)
        // Dans YT-API, on vérifie que mimetype inclut 'mp4' et que 'audioQuality' est défini
        const combinedMp4Videos = formats.filter((v: any) =>
            v.mimeType && v.mimeType.includes('mp4') && v.audioQuality
        );

        // On trie par résolution de la meilleure à la moins bonne
        combinedMp4Videos.sort((a: any, b: any) => {
            const resA = parseInt(a.qualityLabel) || 0;
            const resB = parseInt(b.qualityLabel) || 0;
            return resB - resA;
        });

        // On prend la meilleure qualité disponible
        const bestVideo = combinedMp4Videos.length > 0 ? combinedMp4Videos[0] : null;

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
