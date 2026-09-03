package com.example.server

import android.util.Log
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.withTimeoutOrNull

class ServerResolver(
    private val registry: ProviderRegistry? = null
) {

    suspend fun resolveFromProviders(
        providers: List<ServerProvider>,
        request: MediaRequest,
        defaultTimeoutMs: Long = 8000L
    ): List<ServerStream> = supervisorScope {
        val tasks = providers.map { provider ->
            async {
                val timeoutMs = registry?.getTimeout(provider.id) ?: defaultTimeoutMs
                val startTime = System.currentTimeMillis()

                Log.d("ServerResolver", "[Provider] ${provider.id} started")

                try {
                    val resolvedStreams = withTimeoutOrNull(timeoutMs) {
                        provider.resolve(request)
                    }

                    val duration = System.currentTimeMillis() - startTime

                    if (resolvedStreams == null) {
                        Log.w("ServerResolver", "[Provider] ${provider.id} timeout after ${duration}ms")
                        emptyList<ServerStream>()
                    } else {
                        Log.d("ServerResolver", "[Provider] ${provider.id} success ${duration}ms with ${resolvedStreams.size} streams")
                        // Apply custom labels if configured in registry
                        val customLabel = registry?.getLabel(provider.id)
                        if (!customLabel.isNullOrBlank()) {
                            resolvedStreams.map { it.copy(server = customLabel, name = customLabel) }
                        } else {
                            resolvedStreams
                        }
                    }
                } catch (e: Exception) {
                    val duration = System.currentTimeMillis() - startTime
                    Log.e("ServerResolver", "[Provider] ${provider.id} error after ${duration}ms: ${e.message}")
                    emptyList<ServerStream>()
                }
            }
        }

        tasks.awaitAll().flatten()
    }
}
