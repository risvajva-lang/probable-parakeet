package com.example.server

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ServerApiService(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(6, TimeUnit.SECONDS)
        .build()
) {

    suspend fun fetchRemoteConfig(baseUrl: String): RemoteServerConfig? = withContext(Dispatchers.IO) {
        try {
            val url = "${baseUrl.trimEnd('/')}/v1/config/servers"
            val request = Request.Builder()
                .url(url)
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext null
                val body = response.body?.string() ?: return@withContext null
                val json = JSONObject(body)

                val enabled = json.optBoolean("enabled", true)
                val maxServers = json.optInt("maxServersToResolve", 10)

                val providersList = mutableListOf<ProviderConfig>()
                val providersArray = json.optJSONArray("providers")
                if (providersArray != null) {
                    for (i in 0 until providersArray.length()) {
                        val p = providersArray.optJSONObject(i) ?: continue
                        providersList.add(
                            ProviderConfig(
                                id = p.optString("id"),
                                enabled = p.optBoolean("enabled", true),
                                priority = p.optInt("priority", 100),
                                timeoutMs = p.optLong("timeout", 8000L),
                                label = p.optString("label").takeIf { it.isNotBlank() }
                            )
                        )
                    }
                }

                val sortingObj = json.optJSONObject("sorting")
                val sortingWeights = if (sortingObj != null) {
                    SortingWeights(
                        qualityWeight = sortingObj.optInt("qualityWeight", 40),
                        speedWeight = sortingObj.optInt("speedWeight", 30),
                        priorityWeight = sortingObj.optInt("priorityWeight", 30)
                    )
                } else {
                    SortingWeights()
                }

                RemoteServerConfig(
                    enabled = enabled,
                    maxServersToResolve = maxServers,
                    providers = providersList,
                    sorting = sortingWeights
                )
            }
        } catch (e: Exception) {
            Log.d("ServerApiService", "Failed to fetch remote config from $baseUrl: ${e.message}")
            null
        }
    }

    suspend fun resolveViaBackend(baseUrl: String, mediaRequest: MediaRequest): List<ServerStream>? =
        withContext(Dispatchers.IO) {
            try {
                val url = "${baseUrl.trimEnd('/')}/v1/resolve"
                val jsonBody = JSONObject().apply {
                    put("tmdbId", mediaRequest.tmdbId.toString())
                    put("imdbId", mediaRequest.imdbId ?: JSONObject.NULL)
                    put("type", mediaRequest.type.rawValue)
                    put("title", mediaRequest.title)
                    put("year", mediaRequest.year ?: JSONObject.NULL)
                    put("season", if (mediaRequest.type == com.example.model.MediaType.MOVIE) JSONObject.NULL else mediaRequest.season)
                    put("episode", if (mediaRequest.type == com.example.model.MediaType.MOVIE) JSONObject.NULL else mediaRequest.episode)
                }

                val request = Request.Builder()
                    .url(url)
                    .post(jsonBody.toString().toRequestBody("application/json".toMediaType()))
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) return@withContext null
                    val body = response.body?.string() ?: return@withContext null
                    val json = JSONObject(body)

                    if (!json.optBoolean("success", false)) return@withContext null

                    val resultsArray = json.optJSONArray("results") ?: return@withContext emptyList()
                    val streams = mutableListOf<ServerStream>()

                    for (i in 0 until resultsArray.length()) {
                        val item = resultsArray.optJSONObject(i) ?: continue
                        val prov = item.optString("provider", "remote")
                        val srv = item.optString("server", "Recommended")
                        val streamUrl = item.optString("url")
                        if (streamUrl.isBlank()) continue

                        val type = item.optString("type", "hls")
                        val qStr = item.optString("quality", "1080p")
                        val priority = item.optInt("priority", 100)
                        val isAvailable = item.optBoolean("available", true)

                        streams.add(
                            ServerStream(
                                id = "backend_${prov}_${System.currentTimeMillis()}_$i",
                                provider = prov,
                                server = srv,
                                url = streamUrl,
                                type = type,
                                quality = StreamQuality.fromString(qStr),
                                priority = priority,
                                isAvailable = isAvailable,
                                isPlayable = isAvailable,
                                responseTimeMs = item.optLong("responseTime", 150L)
                            )
                        )
                    }

                    streams
                }
            } catch (e: Exception) {
                Log.d("ServerApiService", "Backend resolve fallback to local providers: ${e.message}")
                null
            }
        }
}
