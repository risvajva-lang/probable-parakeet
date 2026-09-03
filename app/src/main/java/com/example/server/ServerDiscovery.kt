package com.example.server

import android.util.Log

class ServerDiscovery(
    private val registry: ProviderRegistry = ProviderRegistry()
) {

    fun registerProvider(provider: ServerProvider) {
        registry.register(provider)
    }

    fun unregisterProvider(providerId: String) {
        registry.unregister(providerId)
    }

    fun getRegistry(): ProviderRegistry = registry

    suspend fun getAvailableProviders(request: MediaRequest): List<ServerProvider> {
        val eligible = registry.getEligibleProviders(request)
        val available = mutableListOf<ServerProvider>()

        for (provider in eligible) {
            try {
                if (provider.isAvailable()) {
                    available.add(provider)
                } else {
                    Log.d("ServerDiscovery", "[Discovery] Provider ${provider.id} is marked unavailable")
                }
            } catch (e: Exception) {
                Log.w("ServerDiscovery", "[Discovery] Availability check failed for ${provider.id}: ${e.message}")
            }
        }

        Log.d("ServerDiscovery", "[Discovery] Found ${available.size} available providers for ${request.type} (${request.title})")
        return available
    }
}
