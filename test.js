const ytdl = require('@distube/ytdl-core');

async function test() {
    const url = 'https://youtube.com/shorts/wkTxZt2cKQg';
    try {
        const info = await ytdl.getInfo(url);
        console.log("Title: ", info.videoDetails.title);

        // Find format that has both video and audio
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        console.log("Formats with video and audio:");
        formats.forEach(f => {
            console.log(`- quality: ${f.qualityLabel}, itag: ${f.itag}, codec: ${f.videoCodec}, container: ${f.container}`);
        });

    } catch (e) {
        console.error(e);
    }
}

test();
