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

        // Appel à notre propre API Python hébergée gratuitement sur Render
        const renderApiUrl = "https://ztube-api.onrender.com/convert";

        const fetchRes = await fetch(renderApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        let data;
        try {
            data = await fetchRes.json();
        } catch (e) {
            data = { text: await fetchRes.text() };
        }

        if (!fetchRes.ok) {
            console.error("Custom API Error Details:", data);
            throw new Error(`Erreur d'extraction : ` + (data.detail || JSON.stringify(data)));
        }

        if (!data.success || !data.videoData || !data.videoData.downloadUrl) {
            throw new Error("Aucun lien de téléchargement MP4 n'a été trouvé pour cette vidéo.");
        }

        return NextResponse.json({
            success: true,
            message: "Traitement terminé",
            videoData: data.videoData
        });

    } catch (error: any) {
        console.error("Erreur de conversion:", error);
        return NextResponse.json(
            { error: "Erreur serveur : " + (error.message || "impossible de contacter l'API") },
            { status: 500 }
        );
    }
}
