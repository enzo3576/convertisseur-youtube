"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Download, Link2, Sparkles, AlertCircle } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!url.includes("youtube.com/shorts/") && !url.includes("youtu.be/")) {
      setError("Please enter a valid YouTube Shorts link.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to convert video");
      }

      setDownloadUrl(data.videoData?.downloadUrl || "#");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10 hidden-scrollbar"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center p-3 glass-card rounded-full mb-6"
          >
            <Youtube className="w-8 h-8 text-red-500 mr-2" />
            <span className="text-xl font-bold tracking-tight">ShortsConverter</span>
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-glow bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            No Watermark. Pure 1080p.
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto">
            Download any YouTube Short instantly in high definition H.264 MP4 format.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-6 sm:p-10"
        >
          <form onSubmit={handleConvert} className="flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube Shorts link here..."
                className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98]"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Convert to MP4 (1080p)
                </>
              )}
            </button>
          </form>

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 pt-6 border-t border-slate-700/50"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">Ready for Download</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Your video has been successfully processed in 1080p H.264.
                </p>
                <div className="flex gap-4 justify-center">
                  <a
                    href={`/api/download?url=${encodeURIComponent(downloadUrl)}`}
                    download="youtube_short.mp4"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </a>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setUrl("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Convert Another
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-8">
          By using this service, you agree to our Terms of Service.
        </p>
      </motion.main>
    </div>
  );
}

