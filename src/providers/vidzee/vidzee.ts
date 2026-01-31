import { BaseProvider, Subtitle } from '@omss/framework';
import { ProviderCapabilities, ProviderMediaObject, ProviderResult, Source } from '@omss/framework';
import { StreamResponse } from './vidzee.types.js';
import axios from 'axios';

export class VidZeeProvider extends BaseProvider {
    readonly id = 'vidzee';
    readonly name = 'VidZee';
    readonly enabled = true;
    readonly BASE_URL = 'https://player.vidzee.wtf';
    readonly HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150 Safari/537.36',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: this.BASE_URL,
        Origin: this.BASE_URL,
    };

    readonly capabilities: ProviderCapabilities = {
        supportedContentTypes: ['movies'],
    };

    /**
     * Fetch movie sources
     */
    async getMovieSources(media: ProviderMediaObject): Promise<ProviderResult> {
        return this.getSources(media, { type: 'movie' });
    }

    /**
     * Fetch TV episode sources
     */
    async getTVSources(media: ProviderMediaObject): Promise<ProviderResult> {
        if (!media.s || !media.e) {
            return this.emptyResult('Missing season/episode data', media);
        }
        return this.getSources(media, { 
            type: 'tv', 
            season: media.s, 
            episode: media.e 
        });
    }

    /**
     * Main scraping logic - Try all servers in parallel
     */
    private async getSources(
        media: ProviderMediaObject, 
        params: { type: 'movie' | 'tv'; season?: number; episode?: number }
    ): Promise<ProviderResult> {
        try {
            const tmdbId = media.tmdbId;

            // Get decrypt key. needs to be done later
            /*
            const keyReq = await axios.get('https://core.vidzee.wtf/api-key', {
                headers: this.HEADERS,
                timeout: 8000,
            });

            const rawkey = keyReq.data;
            const  */

            // Build server requests based on media type
            const serverPromises = Array.from({ length: 14 }, (_, serverId) =>
                this.fetchServer(tmdbId, serverId, params),
            );

            // Wait for all responses
            const results = await Promise.allSettled(serverPromises);
            const successfulResponses: StreamResponse[] = [];

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status === 'fulfilled' && result.value) {
                    successfulResponses.push(result.value);
                    this.console.debug(`Server ${i} succeeded`, { 
                        provider: result.value.provider,
                        sourcesCount: result.value.url.length,
                        serverInfo: result.value.serverInfo
                    });
                } else {
                    this.console.debug(`Server ${i} failed`);
                }
            }

            if (successfulResponses.length === 0) {
                return this.emptyResult(
                    `No working ${params.type} servers found`, 
                    media
                );
            }

            // Aggregate unique sources and subtitles
            const allSources = new Set<string>();
            const allSubtitles = new Map<string, Subtitle>();
            const sources: Source[] = [];

            for (const response of successfulResponses) {
                // Build master playlist URL
                const masterUrl = response.thumbnail.replace(
                    /\/thumbnail\/thumbnail\.vtt$/,
                    '/index.m3u8',
                );

                if (masterUrl.startsWith('http')) {
                    const proxyUrl = this.createProxyUrl(masterUrl, {
                        ...this.HEADERS,
                        Referer: `${this.BASE_URL}/`,
                    });
                    
                    if (!allSources.has(proxyUrl)) {
                        allSources.add(proxyUrl);
                        
                        sources.push({
                            url: proxyUrl,
                            type: 'hls',
                            quality: 'up to HD',
                            audioTracks: response.url.map(url => ({
                                language: url.lang,
                                label: `${url.name} (${url.flag})`,
                                default: url.lang === 'en',
                            })),
                            provider: {
                                id: this.id,
                                name: `${this.name} (${response.serverInfo.name})`,
                            },
                        });
                    }
                }

                // Add unique subtitles
                for (const track of response.tracks) {
                    if (track.url && track.lang) {
                        const proxySubUrl = this.createProxyUrl(track.url, this.HEADERS);
                        const subId = `${this.id}_sub_${track.lang}_${response.serverInfo.number}`;
                        
                        if (!allSubtitles.has(proxySubUrl)) {
                            allSubtitles.set(proxySubUrl, {
                                url: proxySubUrl,
                                label: track.lang.replace(/\d+/g, '').trim(),
                                format: 'vtt',
                            });
                        }
                    }
                }
            }

            this.console.success(
                `Collected ${sources.length} unique sources, ${allSubtitles.size} unique subtitles`,
                media,
            );

            return {
                sources,
                subtitles: Array.from(allSubtitles.values()),
                diagnostics: [],
            };

        } catch (error) {
            this.console.error('VidZee scrape failed completely', error, media);
            return this.emptyResult(
                error instanceof Error ? error.message : 'Unknown provider error',
                media,
            );
        }
    }

    /**
     * Fetch single server response
     */
    private async fetchServer(
        tmdbId: string, 
        serverId: number, 
        params: { type: 'movie' | 'tv'; season?: number; episode?: number }
    ): Promise<StreamResponse | null> {
        try {
            let url = `https://player.vidzee.wtf/api/server?id=${tmdbId}&sr=${serverId}`;
            
            // Add TV episode params
            if (params.type === 'tv' && params.season && params.episode) {
                url += `&ss=${params.season}&ep=${params.episode}`;
            }

            const response = await axios.get(url, {
                headers: this.HEADERS,
                timeout: 8000,
            });

            const data = response.data;
            
            // Validate StreamResponse structure
            if (
                data &&
                typeof data === 'object' &&
                typeof (data as any).thumbnail === 'string' &&
                Array.isArray((data as any).url) &&
                Array.isArray((data as any).tracks)
            ) {
                return data as StreamResponse;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Return empty result with diagnostic
     */
    private emptyResult(message: string, media: ProviderMediaObject): ProviderResult {
        // @ts-ignore
        this.console.warn('VidZee empty result', { message, tmdbId: media.tmdbId });
        return {
            sources: [],
            subtitles: [],
            diagnostics: [
                {
                    code: 'PROVIDER_ERROR',
                    message: `${this.name}: ${message}`,
                    field: '',
                    severity: 'error',
                },
            ],
        };
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.head(this.BASE_URL, {
                timeout: 5000,
                headers: this.HEADERS,
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }
}
