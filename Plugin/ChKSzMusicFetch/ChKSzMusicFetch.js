const axios = require('axios');

async function processToolCall(toolName, toolInput, dependencies) {
    if (toolName !== 'ChKSzMusicFetch') {
        return { status: "error", error: `Unknown tool: ${toolName}` };
    }

    const { commandIdentifier, commandArguments } = toolInput;
    const apiKey = process.env.CHKSZ_API_KEY;

    if (!apiKey) {
        return { status: "error", error: "Missing CHKSZ_API_KEY in config.env. 请用户前往 https://api.chksz.com/login 获取并配置。" };
    }

    const baseUrl = 'https://api.chksz.com';
    const platform = commandArguments.platform;
    let targetUrl = '';

    try {
        if (commandIdentifier === 'search_music') {
            const keyword = commandArguments.keyword;
            if (platform === '163') targetUrl = `${baseUrl}/api/163_search?keyword=${encodeURIComponent(keyword)}&limit=10&apikey=${apiKey}`;
            else if (platform === 'qq') targetUrl = `${baseUrl}/api/qq_music?msg=${encodeURIComponent(keyword)}&apikey=${apiKey}`;
            else if (platform === 'kugou') targetUrl = `${baseUrl}/api/kugou_music?msg=${encodeURIComponent(keyword)}&apikey=${apiKey}`;
            else return { status: "error", error: "Unsupported platform. Use 163, qq, or kugou." };
        } else if (commandIdentifier === 'get_music_url') {
            const id = commandArguments.id;
            const n = commandArguments.n || '1';
            if (platform === '163') targetUrl = `${baseUrl}/api/163_music?id=${encodeURIComponent(id)}&level=lossless&type=json&apikey=${apiKey}`;
            else if (platform === 'qq') targetUrl = `${baseUrl}/api/qq_music?msg=${encodeURIComponent(id)}&n=${n}&apikey=${apiKey}`;
            else if (platform === 'kugou') targetUrl = `${baseUrl}/api/kugou_music?msg=${encodeURIComponent(id)}&n=${n}&apikey=${apiKey}`;
            else return { status: "error", error: "Unsupported platform. Use 163, qq, or kugou." };
        } else {
            return { status: "error", error: `Unknown command: ${commandIdentifier}` };
        }

        const response = await axios.get(targetUrl);
        return {
            status: "success",
            result: {
                content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
            }
        };
    } catch (error) {
        let errorMsg = error.message;
        if (error.response) {
            errorMsg = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        }
        return { status: "error", error: errorMsg };
    }
}

module.exports = { processToolCall };