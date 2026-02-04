import { OMSSServer } from '@omss/framework';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import config from the built file in api directory
let knownThirdPartyProxies = {};
try {
    const configModule = await import('./config.js');
    knownThirdPartyProxies = configModule.knownThirdPartyProxies || {};
} catch (error) {
    console.warn('Could not load proxy config:', error.message);
}

let serverInstance = null;

async function getServer() {
    if (serverInstance) {
        return serverInstance;
    }

    const server = new OMSSServer({
        name: 'CinePro',
        version: '1.0.0',

        // Network - Vercel handles this
        host: '0.0.0.0',
        port: 3000,
        publicUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.PUBLIC_URL,

        // Cache - Use memory for serverless (Redis requires persistent connection)
        cache: {
            type: 'memory',
            ttl: {
                sources: 60 * 60,
                subtitles: 60 * 60 * 24,
            },
        },

        // TMDB
        tmdb: {
            apiKey: process.env.TMDB_API_KEY,
            cacheTTL: 24 * 60 * 60,
        },

        // Third Party Proxy removal
        proxyConfig: {
            knownThirdPartyProxies: knownThirdPartyProxies,
        },
    });

    // Register providers
    const registry = server.getRegistry();
    const providersPath = path.join(__dirname, './providers/');
    
    try {
        await registry.discoverProviders(providersPath);
        console.log('Providers loaded successfully');
    } catch (error) {
        console.error('Error loading providers:', error.message);
    }

    serverInstance = server;
    return server;
}

export default async function handler(req, res) {
    try {
        const server = await getServer();
        const app = server.getApp();

        // Inject Vercel request/response into Fastify
        await app.ready();
        app.server.emit('request', req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}
