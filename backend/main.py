import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

app = FastAPI(title="Z-Tube Extraction API", version="1.0.0")

# Autoriser toutes les origines (CORS) pour que le frontend Next.js sur Vercel puisse appeler cette API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConvertRequest(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {"message": "Z-Tube Custom Extraction API is running limit-free!"}

@app.post("/convert")
async def extract_video(payload: ConvertRequest):
    if not payload.url:
        raise HTTPException(status_code=400, detail="L'URL est requise")

    # Options pour yt-dlp :
    # 'best[ext=mp4]' garantit que l'on obtient un seul fichier contenant la vidéo et le son,
    # ce qui est indispensable pour un téléchargement direct dans le navigateur sans traitement serveur.
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'best[ext=mp4]/best',
        'noplaylist': True,
        'skip_download': True, # Ne pas télécharger le fichier sur le serveur
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extraction des métadonnées et du lien de téléchargement direct
            info = ydl.extract_info(payload.url, download=False)
            
            # Si le format 'url' n'est pas directement exposé, on le cherche dans les formats demandés
            download_url = info.get('url')
            if not download_url and info.get('requested_formats'):
                download_url = info['requested_formats'][0].get('url')
            
            if not download_url:
                raise HTTPException(status_code=500, detail="Lien de téléchargement direct introuvable")

            return {
                "success": True,
                "videoData": {
                    "title": info.get('title', 'Z-Tube_Video'),
                    "format": "mp4",
                    "resolution": info.get('resolution', 'Unknown'),
                    "downloadUrl": download_url
                }
            }
    except Exception as e:
        print(f"Erreur d'extraction : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
