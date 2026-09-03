package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.CinemaDatabase
import com.example.data.local.FavoriteEntity
import com.example.data.local.HistoryEntity
import com.example.model.AppCategory
import com.example.model.EpisodeInfo
import com.example.model.MediaItem
import com.example.model.MediaType
import com.example.model.ServerProvider
import com.example.network.TmdbRepository
import com.example.player.PlaybackMedia
import com.example.player.PlayerLaunchResult
import com.example.player.PlayerService
import com.example.player.PlayerType
import com.example.player.SubtitleTrack
import com.example.server.MediaRequest
import com.example.server.ServerManager
import com.example.server.ServerStream
import com.example.server.StreamQuality
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class CinemaViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = TmdbRepository()
    private val database = CinemaDatabase.getInstance(application)
    private val favoriteDao = database.favoriteDao()
    private val historyDao = database.historyDao()
    private val serverManager = ServerManager.instance

    val favorites: StateFlow<List<FavoriteEntity>> = favoriteDao.getAllFavorites()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val history: StateFlow<List<HistoryEntity>> = historyDao.getAllHistory()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedCategory = MutableStateFlow(AppCategory.HOME)
    val selectedCategory: StateFlow<AppCategory> = _selectedCategory.asStateFlow()

    // Hero Carousel items
    private val _heroItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val heroItems: StateFlow<List<MediaItem>> = _heroItems.asStateFlow()

    private val _heroItem = MutableStateFlow<MediaItem?>(null)
    val heroItem: StateFlow<MediaItem?> = _heroItem.asStateFlow()

    // Feeds for Home & Section Browsing
    private val _popularTvShows = MutableStateFlow<List<MediaItem>>(emptyList())
    val popularTvShows: StateFlow<List<MediaItem>> = _popularTvShows.asStateFlow()

    private val _topRatedTvShows = MutableStateFlow<List<MediaItem>>(emptyList())
    val topRatedTvShows: StateFlow<List<MediaItem>> = _topRatedTvShows.asStateFlow()

    private val _trendingTvShows = MutableStateFlow<List<MediaItem>>(emptyList())
    val trendingTvShows: StateFlow<List<MediaItem>> = _trendingTvShows.asStateFlow()

    private val _airingTodayTvShows = MutableStateFlow<List<MediaItem>>(emptyList())
    val airingTodayTvShows: StateFlow<List<MediaItem>> = _airingTodayTvShows.asStateFlow()

    private val _returningSeries = MutableStateFlow<List<MediaItem>>(emptyList())
    val returningSeries: StateFlow<List<MediaItem>> = _returningSeries.asStateFlow()

    private val _animeAiringNow = MutableStateFlow<List<MediaItem>>(emptyList())
    val animeAiringNow: StateFlow<List<MediaItem>> = _animeAiringNow.asStateFlow()

    private val _popularMovies = MutableStateFlow<List<MediaItem>>(emptyList())
    val popularMovies: StateFlow<List<MediaItem>> = _popularMovies.asStateFlow()

    private val _topRatedMovies = MutableStateFlow<List<MediaItem>>(emptyList())
    val topRatedMovies: StateFlow<List<MediaItem>> = _topRatedMovies.asStateFlow()

    private val _trendingMovies = MutableStateFlow<List<MediaItem>>(emptyList())
    val trendingMovies: StateFlow<List<MediaItem>> = _trendingMovies.asStateFlow()

    private val _nowPlayingMovies = MutableStateFlow<List<MediaItem>>(emptyList())
    val nowPlayingMovies: StateFlow<List<MediaItem>> = _nowPlayingMovies.asStateFlow()

    private val _upcomingMovies = MutableStateFlow<List<MediaItem>>(emptyList())
    val upcomingMovies: StateFlow<List<MediaItem>> = _upcomingMovies.asStateFlow()

    private val _allTimeGreats = MutableStateFlow<List<MediaItem>>(emptyList())
    val allTimeGreats: StateFlow<List<MediaItem>> = _allTimeGreats.asStateFlow()

    // Backward-compatible media items flow
    private val _mediaItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val mediaItems: StateFlow<List<MediaItem>> = _mediaItems.asStateFlow()

    private val _trendingItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val trendingItems: StateFlow<List<MediaItem>> = _trendingItems.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // Search state
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchResults = MutableStateFlow<List<MediaItem>>(emptyList())
    val searchResults: StateFlow<List<MediaItem>> = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()

    private val _isSearchOpen = MutableStateFlow(false)
    val isSearchOpen: StateFlow<Boolean> = _isSearchOpen.asStateFlow()

    // Genres state
    private val _selectedGenreId = MutableStateFlow<Int?>(null)
    val selectedGenreId: StateFlow<Int?> = _selectedGenreId.asStateFlow()

    private val _selectedGenreName = MutableStateFlow<String?>(null)
    val selectedGenreName: StateFlow<String?> = _selectedGenreName.asStateFlow()

    private val _genreIsTv = MutableStateFlow(true)
    val genreIsTv: StateFlow<Boolean> = _genreIsTv.asStateFlow()

    private val _genreMediaItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val genreMediaItems: StateFlow<List<MediaItem>> = _genreMediaItems.asStateFlow()

    private val _isLoadingGenre = MutableStateFlow(false)
    val isLoadingGenre: StateFlow<Boolean> = _isLoadingGenre.asStateFlow()

    // Networks state matching screenshots 1-7
    private val _selectedNetwork = MutableStateFlow<com.example.ui.components.StreamingNetwork?>(null)
    val selectedNetwork: StateFlow<com.example.ui.components.StreamingNetwork?> = _selectedNetwork.asStateFlow()

    private val _networkMediaItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val networkMediaItems: StateFlow<List<MediaItem>> = _networkMediaItems.asStateFlow()

    private val _isLoadingNetwork = MutableStateFlow(false)
    val isLoadingNetwork: StateFlow<Boolean> = _isLoadingNetwork.asStateFlow()

    // Details Sheet
    private val _detailsMedia = MutableStateFlow<MediaItem?>(null)
    val detailsMedia: StateFlow<MediaItem?> = _detailsMedia.asStateFlow()

    private val _detailsEpisodes = MutableStateFlow<List<EpisodeInfo>>(emptyList())
    val detailsEpisodes: StateFlow<List<EpisodeInfo>> = _detailsEpisodes.asStateFlow()

    // Dynamic Server Selection Screen
    private val _serverSelectionMedia = MutableStateFlow<MediaItem?>(null)
    val serverSelectionMedia: StateFlow<MediaItem?> = _serverSelectionMedia.asStateFlow()

    private val _serverSelectionSeason = MutableStateFlow(1)
    val serverSelectionSeason: StateFlow<Int> = _serverSelectionSeason.asStateFlow()

    private val _serverSelectionEpisode = MutableStateFlow(1)
    val serverSelectionEpisode: StateFlow<Int> = _serverSelectionEpisode.asStateFlow()

    private val _dynamicServers = MutableStateFlow<List<ServerStream>>(emptyList())
    val dynamicServers: StateFlow<List<ServerStream>> = _dynamicServers.asStateFlow()

    private val _isLoadingServers = MutableStateFlow(false)
    val isLoadingServers: StateFlow<Boolean> = _isLoadingServers.asStateFlow()

    // Active Player State
    private val _playerMedia = MutableStateFlow<MediaItem?>(null)
    val playerMedia: StateFlow<MediaItem?> = _playerMedia.asStateFlow()

    private val _selectedServer = MutableStateFlow<ServerProvider?>(null)
    val selectedServer: StateFlow<ServerProvider?> = _selectedServer.asStateFlow()

    private val _activeStreamUrl = MutableStateFlow<String>("")
    val activeStreamUrl: StateFlow<String> = _activeStreamUrl.asStateFlow()

    private val _selectedSeason = MutableStateFlow(1)
    val selectedSeason: StateFlow<Int> = _selectedSeason.asStateFlow()

    private val _selectedEpisode = MutableStateFlow(1)
    val selectedEpisode: StateFlow<Int> = _selectedEpisode.asStateFlow()

    // Player Service & Settings
    val playerService = PlayerService(application)
    val selectedPlayer: StateFlow<PlayerType> = playerService.selectedPlayer

    private val _showSettings = MutableStateFlow(false)
    val showSettings: StateFlow<Boolean> = _showSettings.asStateFlow()

    private val _videoPulsePrompt = MutableStateFlow<VideoPulsePrompt?>(null)
    val videoPulsePrompt: StateFlow<VideoPulsePrompt?> = _videoPulsePrompt.asStateFlow()

    private val _playerChoiceRequest = MutableStateFlow<PlayerChoiceRequest?>(null)
    val playerChoiceRequest: StateFlow<PlayerChoiceRequest?> = _playerChoiceRequest.asStateFlow()

    private var fallbackPlayerOverride: PlayerType? = null

    private var searchJob: Job? = null

    init {
        loadInitialData()
    }

    fun loadInitialData() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val trendingDef = async { repository.getTrending(1) }
                val popTvDef = async { repository.getTvShows("popular", 1) }
                val topTvDef = async { repository.getTvShows("top_rated", 1) }
                val popMovDef = async { repository.getMovies("popular", 1) }
                val topMovDef = async { repository.getMovies("top_rated", 1) }
                val nowPlayDef = async { repository.getMovies("now_playing", 1) }
                val upcomingDef = async { repository.getMovies("upcoming", 1) }
                val airingTodayDef = async { repository.getAiringTodayTv(1) }
                val onAirDef = async { repository.getTvShows("on_the_air", 1) }
                val greatsDef = async { repository.getAllTimeGreats(1) }
                val animeDef = async { repository.getAnime(1) }

                val trending = trendingDef.await()
                _trendingItems.value = trending
                _mediaItems.value = trending

                val heroes = trending.filter { !it.backdropPath.isNullOrBlank() }.take(6)
                _heroItems.value = if (heroes.isNotEmpty()) heroes else trending.take(5)
                _heroItem.value = _heroItems.value.firstOrNull()

                _popularTvShows.value = popTvDef.await()
                _topRatedTvShows.value = topTvDef.await()
                _trendingTvShows.value = trending.filter { it.type == MediaType.TV }
                _airingTodayTvShows.value = airingTodayDef.await()
                _returningSeries.value = onAirDef.await()
                _animeAiringNow.value = animeDef.await()

                _popularMovies.value = popMovDef.await()
                _topRatedMovies.value = topMovDef.await()
                _trendingMovies.value = trending.filter { it.type == MediaType.MOVIE }
                _nowPlayingMovies.value = nowPlayDef.await()
                _upcomingMovies.value = upcomingDef.await()
                _allTimeGreats.value = greatsDef.await()

            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun selectCategory(category: AppCategory) {
        _selectedCategory.value = category
        if (category == AppCategory.SETTINGS) {
            _showSettings.value = true
        } else {
            _showSettings.value = false
        }
        if (category != AppCategory.FAVORITES && category != AppCategory.HISTORY && category != AppCategory.GENRES) {
            // refresh or retain current feeds
        }
    }

    fun openSearch() {
        _isSearchOpen.value = true
    }

    fun closeSearch() {
        _isSearchOpen.value = false
        _searchQuery.value = ""
        _searchResults.value = emptyList()
    }

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
        searchJob?.cancel()
        if (query.isBlank()) {
            _searchResults.value = emptyList()
            _isSearching.value = false
            return
        }
        searchJob = viewModelScope.launch {
            delay(350)
            _isSearching.value = true
            try {
                val results = repository.searchMulti(query)
                _searchResults.value = results
            } catch (_: Exception) {
                _searchResults.value = emptyList()
            } finally {
                _isSearching.value = false
            }
        }
    }

    fun setGenreIsTv(isTv: Boolean) {
        _genreIsTv.value = isTv
        _selectedGenreId.value?.let { id ->
            selectGenre(id, _selectedGenreName.value ?: "")
        }
    }

    fun selectGenre(genreId: Int, genreName: String) {
        _selectedGenreId.value = genreId
        _selectedGenreName.value = genreName
        viewModelScope.launch {
            _isLoadingGenre.value = true
            try {
                val items = repository.getByGenre(genreId, _genreIsTv.value)
                _genreMediaItems.value = items
            } catch (_: Exception) {
                _genreMediaItems.value = emptyList()
            } finally {
                _isLoadingGenre.value = false
            }
        }
    }

    fun clearSelectedGenre() {
        _selectedGenreId.value = null
        _selectedGenreName.value = null
        _genreMediaItems.value = emptyList()
    }

    fun selectNetwork(network: com.example.ui.components.StreamingNetwork) {
        _selectedNetwork.value = network
        viewModelScope.launch {
            _isLoadingNetwork.value = true
            try {
                val items = repository.getByNetwork(network.networkId, network.companyId)
                _networkMediaItems.value = items
            } catch (_: Exception) {
                _networkMediaItems.value = emptyList()
            } finally {
                _isLoadingNetwork.value = false
            }
        }
    }

    fun clearSelectedNetwork() {
        _selectedNetwork.value = null
        _networkMediaItems.value = emptyList()
    }

    fun openDetails(media: MediaItem) {
        _detailsMedia.value = media
        _selectedSeason.value = 1
        _selectedEpisode.value = 1
        viewModelScope.launch {
            val fullDetails = repository.getMediaDetails(media.tmdbId, media.type)
            if (fullDetails != null) {
                _detailsMedia.value = fullDetails
                if (fullDetails.type != MediaType.MOVIE) {
                    loadEpisodes(fullDetails.tmdbId, 1)
                }
            }
        }
    }

    fun closeDetails() {
        _detailsMedia.value = null
        _detailsEpisodes.value = emptyList()
    }

    fun loadEpisodes(tmdbId: Long, seasonNumber: Int) {
        _selectedSeason.value = seasonNumber
        viewModelScope.launch {
            val eps = repository.getSeasonEpisodes(tmdbId, seasonNumber)
            _detailsEpisodes.value = eps
        }
    }

    // Dynamic Server Discovery & Selection
    fun openServerSelection(media: MediaItem, season: Int = 1, episode: Int = 1) {
        _serverSelectionMedia.value = media
        _serverSelectionSeason.value = season
        _serverSelectionEpisode.value = episode
        _dynamicServers.value = emptyList()
        _isLoadingServers.value = true

        viewModelScope.launch {
            try {
                val request = MediaRequest(
                    tmdbId = media.tmdbId,
                    imdbId = media.imdbId,
                    type = media.type,
                    title = media.title,
                    year = media.year,
                    season = season,
                    episode = episode,
                    originalTitle = media.originalTitle,
                    releaseDate = media.releaseDate,
                    mediaId = media.tmdbId.toString()
                )
                val resolved = serverManager.resolve(request)
                _dynamicServers.value = resolved
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoadingServers.value = false
            }
        }
    }

    fun retryServerSelection(media: MediaItem, season: Int = 1, episode: Int = 1) {
        _serverSelectionMedia.value = media
        _serverSelectionSeason.value = season
        _serverSelectionEpisode.value = episode
        _dynamicServers.value = emptyList()
        _isLoadingServers.value = true

        viewModelScope.launch {
            try {
                val request = MediaRequest(
                    tmdbId = media.tmdbId,
                    imdbId = media.imdbId,
                    type = media.type,
                    title = media.title,
                    year = media.year,
                    season = season,
                    episode = episode,
                    originalTitle = media.originalTitle,
                    releaseDate = media.releaseDate,
                    mediaId = media.tmdbId.toString()
                )
                val resolved = serverManager.retry(request)
                _dynamicServers.value = resolved
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoadingServers.value = false
            }
        }
    }

    fun closeServerSelection() {
        _serverSelectionMedia.value = null
        _dynamicServers.value = emptyList()
        _isLoadingServers.value = false
    }

    fun playWithDynamicServer(
        context: android.content.Context,
        server: ServerStream,
        media: MediaItem,
        season: Int = 1,
        episode: Int = 1,
        playerOverride: PlayerType? = null
    ) {
        closeServerSelection()
        _activeStreamUrl.value = server.url
        _selectedSeason.value = season
        _selectedEpisode.value = episode
        _detailsMedia.value = null

        // Add to history
        viewModelScope.launch {
            historyDao.insertHistory(
                HistoryEntity(
                    tmdbId = media.tmdbId,
                    title = media.title,
                    posterPath = media.posterPath,
                    backdropPath = media.backdropPath,
                    type = media.type.rawValue,
                    season = season,
                    episode = episode,
                    voteAverage = media.voteAverage,
                    year = media.year,
                    watchedAt = System.currentTimeMillis()
                )
            )
        }

        val subtitles = listOf(
            SubtitleTrack(name = "العربية (Arabic)", url = "${server.url}&sub=ar", lang = "ar"),
            SubtitleTrack(name = "English", url = "${server.url}&sub=en", lang = "en")
        )

        val playbackMedia = PlaybackMedia(
            id = media.tmdbId,
            title = media.title,
            streamUrl = server.url,
            type = media.type,
            season = season,
            episode = episode,
            seriesName = if (media.type != MediaType.MOVIE) media.title else null,
            posterUrl = media.fullPosterUrl,
            subtitles = subtitles
        )

        val chosenPlayer = playerOverride ?: fallbackPlayerOverride ?: selectedPlayer.value
        fallbackPlayerOverride = null

        val result = playerService.play(playbackMedia, chosenPlayer) {
            _playerMedia.value = media
        }

        when (result) {
            is PlayerLaunchResult.Success -> {}
            is PlayerLaunchResult.NotInstalled -> {
                _videoPulsePrompt.value = VideoPulsePrompt.NotInstalled(media, season, episode)
            }
            is PlayerLaunchResult.LaunchFailed -> {
                _videoPulsePrompt.value = VideoPulsePrompt.LaunchFailed(media, season, episode, result.reason)
            }
            is PlayerLaunchResult.OutdatedVersion -> {
                _videoPulsePrompt.value = VideoPulsePrompt.LaunchFailed(
                    media, season, episode,
                    "نسخة Video Pulse الحالية قديمة (${result.currentVersion}). يرجى تحديث التطبيق."
                )
            }
            is PlayerLaunchResult.InvalidStreamUrl -> {
                _videoPulsePrompt.value = VideoPulsePrompt.LaunchFailed(
                    media, season, episode,
                    "رابط البث غير صالح للتشغيل عبر المشغل الخارجي."
                )
            }
        }
    }

    fun openPlayer(media: MediaItem, season: Int = 1, episode: Int = 1) {
        // Automatically trigger dynamic server selection for pristine server discovery!
        openServerSelection(media, season, episode)
    }

    fun requestPlay(
        context: android.content.Context,
        media: MediaItem,
        season: Int = 1,
        episode: Int = 1,
        playerOverride: PlayerType? = null
    ) {
        val chosenPlayer = playerOverride ?: selectedPlayer.value
        if (chosenPlayer == PlayerType.VIDEO_PULSE && !isVideoPulseInstalled()) {
            _videoPulsePrompt.value = VideoPulsePrompt.NotInstalled(media, season, episode)
            return
        }

        val streamUrl = _activeStreamUrl.value
        if (streamUrl.isNotBlank()) {
            val stream = ServerStream(
                id = "stream_${System.currentTimeMillis()}",
                name = "Video Server",
                providerId = "direct",
                url = streamUrl,
                quality = StreamQuality.FHD_1080P,
                isDirectStream = true
            )
            playWithDynamicServer(context, stream, media, season, episode, playerOverride)
        } else {
            val fallbackServer = selectedServer.value ?: com.example.data.ServersRepository.SERVERS.first()
            val url = com.example.data.ServersRepository.buildServerUrl(
                fallbackServer,
                media.tmdbId,
                media.type,
                season,
                episode
            )
            val stream = ServerStream(
                id = fallbackServer.id,
                name = fallbackServer.name,
                providerId = "fallback",
                url = url,
                quality = StreamQuality.FHD_1080P,
                isDirectStream = true
            )
            playWithDynamicServer(context, stream, media, season, episode, playerOverride)
        }
    }

    fun promptVideoPulseNotInstalled(media: MediaItem, season: Int = 1, episode: Int = 1) {
        _videoPulsePrompt.value = VideoPulsePrompt.NotInstalled(media, season, episode)
    }

    fun closePlayer() {
        _playerMedia.value = null
    }

    fun selectEpisode(episodeNumber: Int) {
        _selectedEpisode.value = episodeNumber
        _playerMedia.value?.let { media ->
            viewModelScope.launch {
                historyDao.insertHistory(
                    HistoryEntity(
                        tmdbId = media.tmdbId,
                        title = media.title,
                        posterPath = media.posterPath,
                        backdropPath = media.backdropPath,
                        type = media.type.rawValue,
                        season = _selectedSeason.value,
                        episode = episodeNumber,
                        voteAverage = media.voteAverage,
                        year = media.year,
                        watchedAt = System.currentTimeMillis()
                    )
                )
            }
        }
    }

    fun toggleFavorite(media: MediaItem) {
        viewModelScope.launch {
            val isFav = favorites.value.any { it.tmdbId == media.tmdbId }
            if (isFav) {
                favoriteDao.deleteFavorite(media.tmdbId)
            } else {
                favoriteDao.insertFavorite(
                    FavoriteEntity(
                        tmdbId = media.tmdbId,
                        title = media.title,
                        posterPath = media.posterPath,
                        backdropPath = media.backdropPath,
                        type = media.type.rawValue,
                        voteAverage = media.voteAverage,
                        year = media.year,
                        addedAt = System.currentTimeMillis()
                    )
                )
            }
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            historyDao.clearHistory()
        }
    }

    fun deleteHistoryItem(tmdbId: Long) {
        viewModelScope.launch {
            historyDao.deleteHistory(tmdbId)
        }
    }

    // Settings & Player Management
    fun openSettings() {
        _showSettings.value = true
        _selectedCategory.value = AppCategory.SETTINGS
    }

    fun closeSettings() {
        _showSettings.value = false
        _selectedCategory.value = AppCategory.HOME
    }

    fun setPlayerPreference(playerType: PlayerType) {
        playerService.setPlayerPreference(playerType)
    }

    fun isVideoPulseInstalled(): Boolean {
        return playerService.externalPlayerService.isVideoPulseInstalled()
    }

    fun getVideoPulseVersion(): String? {
        return playerService.externalPlayerService.getVideoPulseVersion()
    }

    fun promptPlayerChoice(media: MediaItem, season: Int = 1, episode: Int = 1) {
        _playerChoiceRequest.value = PlayerChoiceRequest(media, season, episode)
    }

    fun dismissPlayerChoice() {
        _playerChoiceRequest.value = null
    }

    fun dismissVideoPulsePrompt() {
        _videoPulsePrompt.value = null
    }

    fun installVideoPulse(context: android.content.Context) {
        try {
            val intent = playerService.externalPlayerService.getInstallIntent()
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun retryVideoPulse(context: android.content.Context, media: MediaItem, season: Int = 1, episode: Int = 1) {
        _videoPulsePrompt.value = null
        requestPlay(context, media, season, episode, PlayerType.VIDEO_PULSE)
    }

    fun fallbackToInternal(media: MediaItem, season: Int = 1, episode: Int = 1) {
        _videoPulsePrompt.value = null
        fallbackPlayerOverride = PlayerType.HDOFLIX_INTERNAL
        openServerSelection(media, season, episode)
    }
}

sealed class VideoPulsePrompt {
    data class NotInstalled(val media: MediaItem, val season: Int, val episode: Int) : VideoPulsePrompt()
    data class LaunchFailed(val media: MediaItem, val season: Int, val episode: Int, val reason: String) : VideoPulsePrompt()
}

data class PlayerChoiceRequest(
    val media: MediaItem,
    val season: Int,
    val episode: Int
)
