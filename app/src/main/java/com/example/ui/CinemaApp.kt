package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cast
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Movie
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Tv
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.model.AppCategory
import com.example.model.MediaItem
import com.example.model.MediaType
import com.example.player.PlayerType
import androidx.activity.compose.BackHandler
import com.example.ui.components.CategoryTabs
import com.example.ui.components.CompanySectionRow
import com.example.ui.components.ContinueWatchingRow
import com.example.ui.components.FavoritesView
import com.example.ui.components.GenresView
import com.example.ui.components.HeroBanner
import com.example.ui.components.HistoryView
import com.example.ui.components.MediaDetailsSheet
import com.example.ui.components.MediaSectionRow
import com.example.ui.components.NetworkDetailScreen
import com.example.ui.components.NetworksSectionRow
import com.example.ui.components.POPULAR_COMPANIES
import com.example.ui.components.POPULAR_NETWORKS
import com.example.ui.components.POPULAR_STREAMING_NETWORKS
import com.example.ui.components.PlayerChoiceSheet
import com.example.ui.components.StreamingNetwork
import com.example.ui.components.SearchScreen
import com.example.ui.components.ServerSelectionSheet
import com.example.ui.components.SettingsAndProfileView
import com.example.ui.components.SettingsSheet
import com.example.ui.components.TopTrendingRow
import com.example.ui.components.VideoPlayerSheet
import com.example.ui.components.VideoPulseLaunchFailedDialog
import com.example.ui.components.VideoPulseNotInstalledDialog
import com.example.ui.theme.CinemaBackground
import com.example.ui.theme.CinemaGold
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.CinemaSurface
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.viewmodel.CinemaViewModel
import com.example.viewmodel.VideoPulsePrompt

@Composable
fun CinemaApp(
    viewModel: CinemaViewModel = viewModel()
) {
    val context = LocalContext.current

    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    // Feeds
    val heroItems by viewModel.heroItems.collectAsState()
    val popularTvShows by viewModel.popularTvShows.collectAsState()
    val topRatedTvShows by viewModel.topRatedTvShows.collectAsState()
    val trendingTvShows by viewModel.trendingTvShows.collectAsState()
    val airingTodayTvShows by viewModel.airingTodayTvShows.collectAsState()
    val returningSeries by viewModel.returningSeries.collectAsState()
    val animeAiringNow by viewModel.animeAiringNow.collectAsState()

    val popularMovies by viewModel.popularMovies.collectAsState()
    val topRatedMovies by viewModel.topRatedMovies.collectAsState()
    val trendingMovies by viewModel.trendingMovies.collectAsState()
    val nowPlayingMovies by viewModel.nowPlayingMovies.collectAsState()
    val upcomingMovies by viewModel.upcomingMovies.collectAsState()
    val allTimeGreats by viewModel.allTimeGreats.collectAsState()

    // User Data & Library
    val favorites by viewModel.favorites.collectAsState()
    val history by viewModel.history.collectAsState()

    // Search
    val isSearchOpen by viewModel.isSearchOpen.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val isSearching by viewModel.isSearching.collectAsState()

    // Genres
    val selectedGenreId by viewModel.selectedGenreId.collectAsState()
    val selectedGenreName by viewModel.selectedGenreName.collectAsState()
    val genreIsTv by viewModel.genreIsTv.collectAsState()
    val genreMediaItems by viewModel.genreMediaItems.collectAsState()
    val isLoadingGenre by viewModel.isLoadingGenre.collectAsState()

    // Details Modal
    val detailsMedia by viewModel.detailsMedia.collectAsState()
    val detailsEpisodes by viewModel.detailsEpisodes.collectAsState()

    // Dynamic Server Selection Modal
    val serverSelectionMedia by viewModel.serverSelectionMedia.collectAsState()
    val serverSelectionSeason by viewModel.serverSelectionSeason.collectAsState()
    val serverSelectionEpisode by viewModel.serverSelectionEpisode.collectAsState()
    val dynamicServers by viewModel.dynamicServers.collectAsState()
    val isLoadingServers by viewModel.isLoadingServers.collectAsState()

    // Active Player
    val playerMedia by viewModel.playerMedia.collectAsState()
    val selectedServer by viewModel.selectedServer.collectAsState()
    val activeStreamUrl by viewModel.activeStreamUrl.collectAsState()
    val selectedSeason by viewModel.selectedSeason.collectAsState()
    val selectedEpisode by viewModel.selectedEpisode.collectAsState()

    // Settings & Prompts
    val selectedPlayer by viewModel.selectedPlayer.collectAsState()
    val showSettings by viewModel.showSettings.collectAsState()
    val videoPulsePrompt by viewModel.videoPulsePrompt.collectAsState()
    val playerChoiceRequest by viewModel.playerChoiceRequest.collectAsState()

    // Networks state matching screenshots 1-7
    val selectedNetwork by viewModel.selectedNetwork.collectAsState()
    val networkMediaItems by viewModel.networkMediaItems.collectAsState()
    val isLoadingNetwork by viewModel.isLoadingNetwork.collectAsState()

    BackHandler(enabled = selectedNetwork != null) {
        viewModel.clearSelectedNetwork()
    }

    val handlePlay: (MediaItem, Int, Int) -> Unit = { media, season, episode ->
        if (selectedPlayer == PlayerType.VIDEO_PULSE && !viewModel.isVideoPulseInstalled()) {
            viewModel.promptVideoPulseNotInstalled(media, season, episode)
        } else {
            viewModel.openServerSelection(media, season, episode)
        }
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(CinemaBackground),
        containerColor = CinemaBackground,
        topBar = {
            if (!isSearchOpen && serverSelectionMedia == null && detailsMedia == null && playerMedia == null && selectedNetwork == null) {
                HdoflixTopBar(
                    onOpenSearch = viewModel::openSearch
                )
            }
        },
        bottomBar = {
            if (!isSearchOpen && serverSelectionMedia == null && playerMedia == null && selectedNetwork == null) {
                HdoflixBottomBar(
                    selectedCategory = selectedCategory,
                    onSelectCategory = { cat ->
                        if (detailsMedia != null) {
                            viewModel.closeDetails()
                        }
                        viewModel.selectCategory(cat)
                    }
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(CinemaBackground)
        ) {
            if (detailsMedia != null) {
                MediaDetailsSheet(
                    media = detailsMedia,
                    episodes = detailsEpisodes,
                    isFavorite = favorites.any { it.tmdbId == detailsMedia?.tmdbId },
                    onDismiss = viewModel::closeDetails,
                    onPlayClick = { media, s, e -> handlePlay(media, s, e) },
                    onFavoriteToggle = viewModel::toggleFavorite,
                    onSeasonSelect = { sNum ->
                        detailsMedia?.let { viewModel.loadEpisodes(it.tmdbId, sNum) }
                    }
                )
            } else if (selectedNetwork != null) {
                NetworkDetailScreen(
                    network = selectedNetwork!!,
                    items = networkMediaItems,
                    isLoading = isLoadingNetwork,
                    onBack = viewModel::clearSelectedNetwork,
                    onMediaClick = viewModel::openDetails
                )
            } else {
                when (selectedCategory) {
                    AppCategory.HOME, AppCategory.ALL -> {
                        HomeScreen(
                            heroItems = heroItems,
                            history = history,
                            popularTvShows = popularTvShows,
                            topRatedTvShows = topRatedTvShows,
                            popularMovies = popularMovies,
                            topRatedMovies = topRatedMovies,
                            trendingMovies = trendingMovies,
                            nowPlayingMovies = nowPlayingMovies,
                            upcomingMovies = upcomingMovies,
                            trendingTvShows = trendingTvShows,
                            airingTodayTvShows = airingTodayTvShows,
                            returningSeries = returningSeries,
                            animeAiringNow = animeAiringNow,
                            allTimeGreats = allTimeGreats,
                            selectedCategory = selectedCategory,
                            onSelectCategory = viewModel::selectCategory,
                            onMediaClick = viewModel::openDetails,
                            onWatchClick = { media -> handlePlay(media, 1, 1) },
                            onHistoryItemClick = { item ->
                                val media = MediaItem(
                                    tmdbId = item.tmdbId,
                                    title = item.title,
                                    posterPath = item.posterPath,
                                    backdropPath = item.backdropPath,
                                    type = if (item.type == "tv") MediaType.TV else MediaType.MOVIE,
                                    voteAverage = item.voteAverage,
                                    year = item.year
                                )
                                handlePlay(media, item.season, item.episode)
                            },
                            onNetworkClick = viewModel::selectNetwork
                        )
                    }

                AppCategory.MOVIES, AppCategory.MOVIE -> {
                    MoviesScreen(
                        trendingMovies = trendingMovies,
                        nowPlayingMovies = nowPlayingMovies,
                        popularMovies = popularMovies,
                        topRatedMovies = topRatedMovies,
                        upcomingMovies = upcomingMovies,
                        onMediaClick = viewModel::openDetails
                    )
                }

                AppCategory.TV -> {
                    TvShowsScreen(
                        popularTvShows = popularTvShows,
                        topRatedTvShows = topRatedTvShows,
                        trendingTvShows = trendingTvShows,
                        airingTodayTvShows = airingTodayTvShows,
                        returningSeries = returningSeries,
                        onMediaClick = viewModel::openDetails
                    )
                }

                AppCategory.GENRES -> {
                    GenresView(
                        isTv = genreIsTv,
                        onToggleType = viewModel::setGenreIsTv,
                        selectedGenreId = selectedGenreId,
                        selectedGenreName = selectedGenreName,
                        genreMediaItems = genreMediaItems,
                        isLoadingGenre = isLoadingGenre,
                        onSelectGenre = viewModel::selectGenre,
                        onClearGenre = viewModel::clearSelectedGenre,
                        onMediaClick = viewModel::openDetails
                    )
                }

                AppCategory.SETTINGS -> {
                    SettingsAndProfileView(
                        selectedPlayer = selectedPlayer,
                        isVideoPulseInstalled = viewModel.isVideoPulseInstalled(),
                        videoPulseVersion = viewModel.getVideoPulseVersion(),
                        onSelectPlayer = viewModel::setPlayerPreference,
                        onInstallVideoPulse = { viewModel.installVideoPulse(context) },
                        onOpenFavorites = { viewModel.selectCategory(AppCategory.FAVORITES) },
                        onOpenHistory = { viewModel.selectCategory(AppCategory.HISTORY) },
                        onClearHistory = viewModel::clearHistory
                    )
                }

                AppCategory.FAVORITES -> {
                    FavoritesView(
                        favorites = favorites,
                        onItemClick = viewModel::openDetails,
                        onDeleteFavorite = viewModel::deleteHistoryItem,
                        onPlayClick = { media -> handlePlay(media, 1, 1) }
                    )
                }

                AppCategory.HISTORY -> {
                    HistoryView(
                        history = history,
                        onItemClick = viewModel::openDetails,
                        onResumeWatching = { media, s, e -> handlePlay(media, s, e) },
                        onDeleteHistoryItem = viewModel::deleteHistoryItem,
                        onClearHistory = viewModel::clearHistory
                    )
                }

                else -> {
                    HomeScreen(
                        heroItems = heroItems,
                        history = history,
                        popularTvShows = popularTvShows,
                        topRatedTvShows = topRatedTvShows,
                        popularMovies = popularMovies,
                        topRatedMovies = topRatedMovies,
                        trendingMovies = trendingMovies,
                        nowPlayingMovies = nowPlayingMovies,
                        upcomingMovies = upcomingMovies,
                        trendingTvShows = trendingTvShows,
                        airingTodayTvShows = airingTodayTvShows,
                        returningSeries = returningSeries,
                        allTimeGreats = allTimeGreats,
                        selectedCategory = selectedCategory,
                        onSelectCategory = viewModel::selectCategory,
                        onMediaClick = viewModel::openDetails,
                        onWatchClick = { media -> handlePlay(media, 1, 1) },
                        onHistoryItemClick = { item ->
                            val media = MediaItem(
                                tmdbId = item.tmdbId,
                                title = item.title,
                                posterPath = item.posterPath,
                                backdropPath = item.backdropPath,
                                type = if (item.type == "tv") MediaType.TV else MediaType.MOVIE,
                                voteAverage = item.voteAverage,
                                year = item.year
                            )
                            handlePlay(media, item.season, item.episode)
                        },
                        onNetworkClick = viewModel::selectNetwork
                    )
                }
            }
        }

            if (isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(CinemaBackground.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = CinemaRed)
                }
            }
        }
    }

    // Fullscreen Search Overlay matching screenshot 11
    if (isSearchOpen) {
        SearchScreen(
            query = searchQuery,
            onQueryChanged = viewModel::onSearchQueryChanged,
            results = searchResults,
            isSearching = isSearching,
            onClose = viewModel::closeSearch,
            onMediaClick = viewModel::openDetails
        )
    }

    // Dynamic Server Selection Sheet matching screenshots 16 & 17
    if (serverSelectionMedia != null) {
        ServerSelectionSheet(
            media = serverSelectionMedia,
            season = serverSelectionSeason,
            episode = serverSelectionEpisode,
            servers = dynamicServers,
            isLoading = isLoadingServers,
            onServerSelected = { server ->
                viewModel.playWithDynamicServer(
                    context = context,
                    server = server,
                    media = serverSelectionMedia!!,
                    season = serverSelectionSeason,
                    episode = serverSelectionEpisode
                )
            },
            onClose = viewModel::closeServerSelection,
            onRetry = {
                serverSelectionMedia?.let {
                    viewModel.retryServerSelection(it, serverSelectionSeason, serverSelectionEpisode)
                }
            }
        )
    }

    // In-App Video Player Sheet (if internal player selected)
    if (playerMedia != null) {
        val serverFallback = selectedServer ?: com.example.data.ServersRepository.SERVERS.first()
        VideoPlayerSheet(
            media = playerMedia!!,
            selectedServer = serverFallback,
            seasonNumber = selectedSeason,
            episodeNumber = selectedEpisode,
            episodes = detailsEpisodes,
            streamUrl = activeStreamUrl.takeIf { it.isNotBlank() },
            onClose = viewModel::closePlayer,
            onSelectServer = { /* handled dynamically */ },
            onSelectEpisode = viewModel::selectEpisode,
            onOpenInVideoPulse = {
                viewModel.requestPlay(
                    context = context,
                    media = playerMedia!!,
                    season = selectedSeason,
                    episode = selectedEpisode,
                    playerOverride = PlayerType.VIDEO_PULSE
                )
            }
        )
    }

    // External Player Prompts & Dialogs
    when (val prompt = videoPulsePrompt) {
        is VideoPulsePrompt.NotInstalled -> {
            VideoPulseNotInstalledDialog(
                onInstall = { viewModel.installVideoPulse(context) },
                onFallbackToInternal = {
                    viewModel.fallbackToInternal(prompt.media, prompt.season, prompt.episode)
                },
                onDismiss = viewModel::dismissVideoPulsePrompt
            )
        }
        is VideoPulsePrompt.LaunchFailed -> {
            VideoPulseLaunchFailedDialog(
                reason = prompt.reason,
                onRetry = {
                    viewModel.retryVideoPulse(context, prompt.media, prompt.season, prompt.episode)
                },
                onFallbackToInternal = {
                    viewModel.fallbackToInternal(prompt.media, prompt.season, prompt.episode)
                },
                onDismiss = viewModel::dismissVideoPulsePrompt
            )
        }
        null -> Unit
    }

    // Player Choice Prompt if configured
    val choiceReq = playerChoiceRequest
    if (choiceReq != null) {
        PlayerChoiceSheet(
            media = choiceReq.media,
            seasonNumber = choiceReq.season,
            episodeNumber = choiceReq.episode,
            isVideoPulseInstalled = viewModel.isVideoPulseInstalled(),
            videoPulseVersion = viewModel.getVideoPulseVersion(),
            onChoosePlayer = { chosen ->
                viewModel.dismissPlayerChoice()
                viewModel.requestPlay(context, choiceReq.media, choiceReq.season, choiceReq.episode, chosen)
            },
            onInstallVideoPulse = { viewModel.installVideoPulse(context) },
            onDismiss = viewModel::dismissPlayerChoice
        )
    }
}

@Composable
fun HdoflixTopBar(
    onOpenSearch: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(CinemaBackground)
            .border(
                width = 0.8.dp,
                color = Color(0x1AFFFFFF)
            )
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Authentic HDOFLIX Brand Logo
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { }
        ) {
            // HDO in White + FLIX in Red Pill
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "HDO",
                    color = Color.White,
                    fontSize = 21.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.width(3.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(CinemaRed)
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "FLIX",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // App Name Subtitle
            Text(
                text = "نافذة السينما",
                color = Color(0xFFCBD5E1),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Top Bar Action Buttons (Cast, Language, Search)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Cast Button
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF16181F))
                    .border(0.8.dp, Color(0x22FFFFFF), CircleShape)
                    .clickable { },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Cast,
                    contentDescription = "Cast",
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Language selector pill (🌐 🇸🇦 AR)
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF16181F))
                    .border(0.8.dp, Color(0x33FFFFFF), RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp)
                    .testTag("top_bar_language_pill"),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "🌐 🇸🇦", fontSize = 11.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "AR",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Search Action Button
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF16181F))
                    .border(0.8.dp, Color(0x22FFFFFF), CircleShape)
                    .clickable(onClick = onOpenSearch)
                    .testTag("top_bar_search_button"),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = "Search",
                    tint = CinemaRed,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun HdoflixBottomBar(
    selectedCategory: AppCategory,
    onSelectCategory: (AppCategory) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        modifier = modifier
            .fillMaxWidth()
            .border(width = 0.8.dp, color = Color(0x1AFFFFFF))
            .testTag("hdoflix_bottom_navigation"),
        containerColor = Color(0xFF0E1015),
        tonalElevation = 8.dp
    ) {
        // 1. الرئيسية
        NavigationBarItem(
            selected = selectedCategory == AppCategory.HOME || selectedCategory == AppCategory.ALL,
            onClick = { onSelectCategory(AppCategory.HOME) },
            icon = {
                Icon(
                    imageVector = if (selectedCategory == AppCategory.HOME) Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = "الرئيسية"
                )
            },
            label = { Text("الرئيسية", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CinemaRed,
                selectedTextColor = CinemaRed,
                unselectedIconColor = Color(0xFF8C93A4),
                unselectedTextColor = Color(0xFF8C93A4),
                indicatorColor = Color.Transparent
            )
        )

        // 2. الأفلام
        NavigationBarItem(
            selected = selectedCategory == AppCategory.MOVIES || selectedCategory == AppCategory.MOVIE,
            onClick = { onSelectCategory(AppCategory.MOVIES) },
            icon = {
                Icon(
                    imageVector = if (selectedCategory == AppCategory.MOVIES) Icons.Filled.Movie else Icons.Outlined.Movie,
                    contentDescription = "الأفلام"
                )
            },
            label = { Text("الأفلام", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CinemaRed,
                selectedTextColor = CinemaRed,
                unselectedIconColor = Color(0xFF8C93A4),
                unselectedTextColor = Color(0xFF8C93A4),
                indicatorColor = Color.Transparent
            )
        )

        // 3. المسلسلات
        NavigationBarItem(
            selected = selectedCategory == AppCategory.TV,
            onClick = { onSelectCategory(AppCategory.TV) },
            icon = {
                Icon(
                    imageVector = if (selectedCategory == AppCategory.TV) Icons.Filled.Tv else Icons.Outlined.Tv,
                    contentDescription = "المسلسلات"
                )
            },
            label = { Text("المسلسلات", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CinemaRed,
                selectedTextColor = CinemaRed,
                unselectedIconColor = Color(0xFF8C93A4),
                unselectedTextColor = Color(0xFF8C93A4),
                indicatorColor = Color.Transparent
            )
        )

        // 4. التصنيفات
        NavigationBarItem(
            selected = selectedCategory == AppCategory.GENRES,
            onClick = { onSelectCategory(AppCategory.GENRES) },
            icon = {
                Icon(
                    imageVector = if (selectedCategory == AppCategory.GENRES) Icons.Filled.Category else Icons.Outlined.Category,
                    contentDescription = "التصنيفات"
                )
            },
            label = { Text("التصنيفات", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CinemaRed,
                selectedTextColor = CinemaRed,
                unselectedIconColor = Color(0xFF8C93A4),
                unselectedTextColor = Color(0xFF8C93A4),
                indicatorColor = Color.Transparent
            )
        )

        // 5. الإعدادات
        NavigationBarItem(
            selected = selectedCategory == AppCategory.SETTINGS,
            onClick = { onSelectCategory(AppCategory.SETTINGS) },
            icon = {
                Icon(
                    imageVector = if (selectedCategory == AppCategory.SETTINGS) Icons.Filled.Settings else Icons.Outlined.Settings,
                    contentDescription = "الإعدادات"
                )
            },
            label = { Text("الإعدادات", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CinemaRed,
                selectedTextColor = CinemaRed,
                unselectedIconColor = Color(0xFF8C93A4),
                unselectedTextColor = Color(0xFF8C93A4),
                indicatorColor = Color.Transparent
            )
        )
    }
}

@Composable
fun HomeScreen(
    heroItems: List<MediaItem>,
    history: List<com.example.data.local.HistoryEntity>,
    popularTvShows: List<MediaItem>,
    topRatedTvShows: List<MediaItem>,
    popularMovies: List<MediaItem>,
    topRatedMovies: List<MediaItem>,
    trendingMovies: List<MediaItem>,
    nowPlayingMovies: List<MediaItem>,
    upcomingMovies: List<MediaItem>,
    trendingTvShows: List<MediaItem>,
    airingTodayTvShows: List<MediaItem>,
    returningSeries: List<MediaItem>,
    animeAiringNow: List<MediaItem> = emptyList(),
    allTimeGreats: List<MediaItem>,
    selectedCategory: AppCategory = AppCategory.HOME,
    onSelectCategory: (AppCategory) -> Unit = {},
    onMediaClick: (MediaItem) -> Unit,
    onWatchClick: (MediaItem) -> Unit,
    onHistoryItemClick: (com.example.data.local.HistoryEntity) -> Unit,
    onNetworkClick: (StreamingNetwork) -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Hero Banner Carousel
        if (heroItems.isNotEmpty()) {
            item {
                HeroBanner(
                    items = heroItems,
                    onMediaClick = onMediaClick,
                    onWatchClick = onWatchClick
                )
            }
        }

        // Category Tabs Matching cinema-999885window CategoryNav
        item {
            CategoryTabs(
                selectedCategory = selectedCategory,
                onSelectCategory = onSelectCategory
            )
        }

        // Top Trending Row (#1, #2, #3 VIP badges)
        if (trendingMovies.isNotEmpty()) {
            item {
                TopTrendingRow(
                    trendingItems = trendingMovies,
                    onItemClick = onMediaClick
                )
            }
        }

        // Popular Networks ("الشبكات العالمية الشهيرة")
        item {
            NetworksSectionRow(
                title = "الشبكات العالمية الشهيرة",
                networks = POPULAR_STREAMING_NETWORKS,
                onNetworkClick = onNetworkClick
            )
        }

        // Continue Watching Row (if history not empty)
        if (history.isNotEmpty()) {
            item {
                ContinueWatchingRow(
                    historyItems = history,
                    onHistoryItemClick = onHistoryItemClick
                )
            }
        }

        // Popular TV Shows
        item {
            MediaSectionRow(
                title = "أحدث وأقوى المسلسلات",
                items = popularTvShows,
                onMediaClick = onMediaClick
            )
        }

        // Top Rated TV
        item {
            MediaSectionRow(
                title = "مسلسلات الأعلى تقييماً ★",
                items = topRatedTvShows,
                onMediaClick = onMediaClick
            )
        }

        // Popular Movies
        item {
            MediaSectionRow(
                title = "روائع الأفلام السينمائية",
                items = popularMovies,
                onMediaClick = onMediaClick
            )
        }

        // Top Rated Movies
        item {
            MediaSectionRow(
                title = "أفلام الأعلى تقييماً عالمياً ★",
                items = topRatedMovies,
                onMediaClick = onMediaClick
            )
        }

        // Popular Companies Section
        item {
            CompanySectionRow(
                title = "الاستوديوهات والشركات المنتجة",
                items = POPULAR_COMPANIES
            )
        }

        // In Cinemas Now
        item {
            MediaSectionRow(
                title = "يعرض الآن في دور السينما",
                items = nowPlayingMovies,
                onMediaClick = onMediaClick
            )
        }

        // Trending TV Shows
        item {
            MediaSectionRow(
                title = "مسلسلات رائجة اليوم ⚡",
                items = trendingTvShows,
                onMediaClick = onMediaClick
            )
        }

        // Airing Today
        item {
            MediaSectionRow(
                title = "حلقات تعرض اليوم",
                items = airingTodayTvShows,
                onMediaClick = onMediaClick
            )
        }

        // Anime Airing Now
        if (animeAiringNow.isNotEmpty()) {
            item {
                MediaSectionRow(
                    title = "أنمي يعرض الآن 🎌",
                    items = animeAiringNow,
                    onMediaClick = onMediaClick
                )
            }
        }

        // Coming Soon
        item {
            MediaSectionRow(
                title = "قريباً في صالات العرض 🎬",
                items = upcomingMovies,
                onMediaClick = onMediaClick
            )
        }

        // Returning Series
        item {
            MediaSectionRow(
                title = "مواسم متجددة ومستمرة",
                items = returningSeries,
                onMediaClick = onMediaClick
            )
        }

        // All-Time Greats
        item {
            MediaSectionRow(
                title = "كلاسيكيات وتحف سينمائية خالدة",
                items = allTimeGreats,
                onMediaClick = onMediaClick
            )
        }
    }
}

@Composable
fun MoviesScreen(
    trendingMovies: List<MediaItem>,
    nowPlayingMovies: List<MediaItem>,
    popularMovies: List<MediaItem>,
    topRatedMovies: List<MediaItem>,
    upcomingMovies: List<MediaItem>,
    onMediaClick: (MediaItem) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            MediaSectionRow(
                title = "أفلام رائجة اليوم ⚡",
                items = trendingMovies,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "يعرض الآن في صالات السينما",
                items = nowPlayingMovies,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "أفلام سينمائية مميزة",
                items = popularMovies,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "الأعلى تقييماً في تاريخ السينما ★",
                items = topRatedMovies,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "قريباً في دور العرض 🎬",
                items = upcomingMovies,
                onMediaClick = onMediaClick
            )
        }
    }
}

@Composable
fun TvShowsScreen(
    popularTvShows: List<MediaItem>,
    topRatedTvShows: List<MediaItem>,
    trendingTvShows: List<MediaItem>,
    airingTodayTvShows: List<MediaItem>,
    returningSeries: List<MediaItem>,
    onMediaClick: (MediaItem) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        item {
            MediaSectionRow(
                title = "أقوى المسلسلات العالمية",
                items = popularTvShows,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "مسلسلات الأعلى تقييماً ★",
                items = topRatedTvShows,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "المسلسلات الأكثر تداولاً ⚡",
                items = trendingTvShows,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "حلقات تعرض اليوم على الشاشة",
                items = airingTodayTvShows,
                onMediaClick = onMediaClick
            )
        }
        item {
            MediaSectionRow(
                title = "مواسم مستمرة ومتجددة",
                items = returningSeries,
                onMediaClick = onMediaClick
            )
        }
    }
}
