package com.example.server

import android.util.Log
import com.example.data.ServersRepository
import com.example.server.providers.AshgroveProvider
import com.example.server.providers.AutoEmbedProvider
import com.example.server.providers.ConfiguredServerProvider
import com.example.server.providers.EmbedWiseProvider
import com.example.server.providers.FerrowProvider
import com.example.server.providers.LarkspurProvider
import com.example.server.providers.LicensedDirectStreamProvider
import com.example.server.providers.SmashyStreamProvider
import com.example.server.providers.SuperEmbedProvider
import com.example.server.providers.VidSrcProvider
import com.example.server.providers.WisteriaProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext

class ServerManager(
    private val config: ServerManagerConfig = ServerManagerConfig()
) {
    private val registry = ProviderRegistry()
    private val discovery = ServerDiscovery(registry)
    private val resolver = ServerResolver(registry)
    private val validator = ServerValidator()
    private val deduplicator = ServerDeduplicator()
    private val sorter = ServerSorter(config.sortingWeights)
    private val cache = ServerCache(config.cacheTtlMs)
    private val apiService = ServerApiService()

    init {
        // Register default out-of-the-box dynamic server provider adapters
        registry.register(LicensedDirectStreamProvider())
        registry.register(WisteriaProvider())
        registry.register(LarkspurProvider())
        registry.register(FerrowProvider())
        registry.register(AshgroveProvider())
        registry.register(VidSrcProvider())
        registry.register(SuperEmbedProvider())
        registry.register(AutoEmbedProvider())
        registry.register(SmashyStreamProvider())
        registry.register(EmbedWiseProvider())

        // Register all authentic HDOFLIX servers from the repository
        ServersRepository.SERVERS.forEach { serverData ->
            registry.register(ConfiguredServerProvider(serverData))
        }
    }

    fun registerProvider(provider: ServerProvider) {
        registry.register(provider)
    }

    fun unregisterProvider(providerId: String) {
        registry.unregister(providerId)
    }

    suspend fun syncRemoteConfig(baseUrl: String) {
        val remoteConfig = apiService.fetchRemoteConfig(baseUrl)
        if (remoteConfig != null && remoteConfig.enabled) {
            registry.applyRemoteConfigs(remoteConfig.providers)
        }
    }

    suspend fun resolve(request: MediaRequest, forceRefresh: Boolean = false): List<ServerStream> =
        withContext(Dispatchers.IO) {
            Log.d(
                "ServerManager",
                "[ServerManager] Resolving ${request.type.rawValue} \"${request.title}\" " +
                        "(TMDB: ${request.tmdbId}, IMDb: ${request.imdbId ?: "N/A"}, S${request.season}E${request.episode})"
            )

            // 1. Cache Check (skipped if forceRefresh is true)
            if (!forceRefresh && config.enableCache) {
                val cached = cache.get(request)
                if (!cached.isNullOrEmpty()) {
                    Log.d("ServerManager", "[ServerManager] Returning ${cached.size} cached servers")
                    return@withContext cached
                }
            } else if (forceRefresh) {
                cache.evict(request)
            }

            // Optional Backend Resolution if configured
            if (!config.backendUrl.isNullOrBlank()) {
                val backendResults = apiService.resolveViaBackend(config.backendUrl, request)
                if (!backendResults.isNullOrEmpty()) {
                    val unique = deduplicator.deduplicate(backendResults)
                    val sorted = sorter.sort(unique, config.sortingWeights)
                    val finalResults = sorted.take(config.maxServersToReturn)
                    if (config.enableCache) {
                        cache.set(request, finalResults)
                    }
                    Log.d("ServerManager", "[ServerManager] Resolved ${finalResults.size} servers via backend API")
                    return@withContext finalResults
                }
            }

            // 2. Server Discovery: Identify and check availability of eligible providers
            val availableProviders = discovery.getAvailableProviders(request)
            if (availableProviders.isEmpty()) {
                Log.w("ServerManager", "[ServerManager] No available providers found for ${request.type}")
                return@withContext emptyList()
            }

            // 3. Provider/Server Resolution: Execute extractions concurrently with individual timeouts
            val rawStreams = resolver.resolveFromProviders(
                providers = availableProviders,
                request = request,
                defaultTimeoutMs = config.timeoutPerProviderMs
            )

            if (rawStreams.isEmpty()) {
                Log.w("ServerManager", "[ServerManager] Providers returned 0 raw streams")
                return@withContext emptyList()
            }

            // 4. Deduplication: Filter identical streams across providers
            val uniqueStreams = deduplicator.deduplicate(rawStreams)

            // 5. Validation: Verify URL, protocol, reachability and latency
            val validatedStreams = uniqueStreams.map { stream ->
                async {
                    val validation = validator.validate(stream)
                    stream.copy(
                        isPlayable = validation.isValid,
                        isAvailable = validation.isValid,
                        responseTimeMs = validation.responseTimeMs
                    )
                }
            }.awaitAll()

            // 6. Filter playable servers (fallback to all with isPlayable flag if all were strictly blocked by client probe)
            val playableStreams = validatedStreams.filter { it.isPlayable }
            val candidateStreams = if (playableStreams.isNotEmpty()) playableStreams else validatedStreams

            // 7. Priority & Quality Sorting: Order by Playable -> Quality -> Latency -> Priorities
            val sortedStreams = sorter.sort(candidateStreams, config.sortingWeights)

            // 8. Truncate to Max Servers To Return
            val finalServerList = sortedStreams.take(config.maxServersToReturn)

            // 9. Store in cache
            if (config.enableCache && finalServerList.isNotEmpty()) {
                cache.set(request, finalServerList)
            }

            Log.d(
                "ServerManager",
                "[ServerManager] Successfully resolved ${finalServerList.size} playable servers for ${request.title}"
            )

            finalServerList
        }

    // Alias for getPlayableServers
    suspend fun getPlayableServers(request: MediaRequest): List<ServerStream> =
        resolve(request, forceRefresh = false)

    suspend fun retry(request: MediaRequest): List<ServerStream> {
        Log.d("ServerManager", "[ServerManager] Retrying server resolution for ${request.title}")
        return resolve(request, forceRefresh = true)
    }

    fun clearCache() {
        cache.clear()
    }

    fun evictCache(request: MediaRequest) {
        cache.evict(request)
    }

    companion object {
        val instance: ServerManager by lazy { ServerManager() }
    }
}
