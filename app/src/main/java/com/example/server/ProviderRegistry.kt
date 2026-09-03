package com.example.server

import android.util.Log
import java.util.concurrent.ConcurrentHashMap

class ProviderRegistry {

    private val providers = ConcurrentHashMap<String, ServerProvider>()
    private val configs = ConcurrentHashMap<String, ProviderConfig>()

    fun register(provider: ServerProvider) {
        providers[provider.id] = provider
        if (!configs.containsKey(provider.id)) {
            configs[provider.id] = ProviderConfig(
                id = provider.id,
                enabled = true,
                priority = provider.priority,
                supportsMovie = true,
                supportsTv = true,
                timeoutMs = 8000L,
                label = provider.name
            )
        }
    }

    fun unregister(providerId: String) {
        providers.remove(providerId)
        configs.remove(providerId)
    }

    fun getAllProviders(): List<ServerProvider> {
        return providers.values.sortedByDescending { getEffectivePriority(it.id) }
    }

    fun getEligibleProviders(request: MediaRequest): List<ServerProvider> {
        return providers.values
            .filter { provider ->
                val config = configs[provider.id]
                val isEnabled = config?.enabled != false
                val supportsRequest = provider.supports(request)
                isEnabled && supportsRequest
            }
            .sortedByDescending { getEffectivePriority(it.id) }
    }

    fun getTimeout(providerId: String): Long {
        return configs[providerId]?.timeoutMs ?: 8000L
    }

    fun getLabel(providerId: String): String? {
        return configs[providerId]?.label
    }

    private fun getEffectivePriority(providerId: String): Int {
        return configs[providerId]?.priority ?: providers[providerId]?.priority ?: 50
    }

    fun updateConfig(config: ProviderConfig) {
        configs[config.id] = config
    }

    fun applyRemoteConfigs(remoteConfigs: List<ProviderConfig>) {
        for (cfg in remoteConfigs) {
            configs[cfg.id] = cfg
            Log.d("ProviderRegistry", "Updated provider config for ${cfg.id}: enabled=${cfg.enabled}, priority=${cfg.priority}")
        }
    }

    fun clear() {
        providers.clear()
        configs.clear()
    }
}
