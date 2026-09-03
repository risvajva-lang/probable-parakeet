import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { UserSettings, Locale } from '../types';
import { setLocale, getLocale, t } from '../i18n';
import { traktAuthService } from '../auth/TraktAuthService';
import { downloadManager } from '../downloads/DownloadManager';
import { libraryManager } from '../library/LibraryManager';
import { colors, typography, borderRadius } from '../theme/theme';

interface SettingsScreenProps {
  onLocaleChange: (locale: Locale) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLocaleChange }) => {
  const [currentLang, setCurrentLang] = useState<Locale>(getLocale());
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [skipIntro, setSkipIntro] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState<'4K' | '1080p' | '720p'>('1080p');
  const [defaultPlayer, setDefaultPlayer] = useState<'internal' | 'system' | 'vlc' | 'mx'>('internal');

  // Subtitles
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subSize, setSubSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [preferredSubLang, setPreferredSubLang] = useState('ar');

  // Trakt Auth State
  const [traktState, setTraktState] = useState(traktAuthService.getState());

  useEffect(() => {
    const unsub = traktAuthService.subscribe(() => {
      setTraktState(traktAuthService.getState());
    });
    return unsub;
  }, []);

  const handleLanguageSelect = (lang: Locale) => {
    setCurrentLang(lang);
    setLocale(lang);
    onLocaleChange(lang);
  };

  const handleTraktToggle = async () => {
    if (traktState.isAuthenticated) {
      await traktAuthService.logout();
      Alert.alert('Trakt', 'تم تسجيل الخروج من Trakt بنجاح');
    } else {
      await traktAuthService.loginWithCode();
      Alert.alert('Trakt', 'تم الاتصال بحساب Trakt بنجاح!');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'تأكيد المسح',
      'هل أنت متأكد من رغبتك في مسح سجل المشاهدة بالكامل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: () => {
            libraryManager.clearCategory('history');
            Alert.alert('تم المسح', 'تم مسح سجل المشاهدة بنجاح');
          },
        },
      ]
    );
  };

  const languages: Array<{ code: Locale; name: string }> = [
    { code: 'ar', name: 'العربية (Arabic - RTL)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ur', name: 'اردو (Urdu - RTL)' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'tr', name: 'Türkçe' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <Text style={styles.headerSubtitle}>تخصيص المشغل والترجمة والمزامنة السحابية</Text>
      </View>

      {/* 1. General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🌐 {t('settings.general')}</Text>

        {/* App Language */}
        <Text style={styles.subHeader}>{t('settings.language')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langPills}>
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langPill, currentLang === l.code && styles.langPillActive]}
              onPress={() => handleLanguageSelect(l.code)}
            >
              <Text style={[styles.langPillText, currentLang === l.code && styles.langPillTextActive]}>
                {l.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 2. Playback & Player */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🎬 {t('settings.playback')}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelCol}>
            <Text style={styles.settingLabel}>{t('settings.autoPlayNext')}</Text>
            <Text style={styles.settingDesc}>تشغيل الحلقة التالية تلقائياً عند انتهاء الحالية</Text>
          </View>
          <Switch
            value={autoplayNext}
            onValueChange={setAutoplayNext}
            trackColor={{ false: '#263042', true: colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelCol}>
            <Text style={styles.settingLabel}>{t('settings.skipIntroByDefault')}</Text>
            <Text style={styles.settingDesc}>القفز التلقائي عن شارة البداية (85 ثانية)</Text>
          </View>
          <Switch
            value={skipIntro}
            onValueChange={setSkipIntro}
            trackColor={{ false: '#263042', true: colors.primary }}
          />
        </View>

        {/* Default Quality Selector */}
        <View style={styles.pickerRow}>
          <Text style={styles.settingLabel}>{t('settings.defaultQuality')}</Text>
          <View style={styles.segmentedControl}>
            {(['720p', '1080p', '4K'] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.segBtn, defaultQuality === q && styles.segBtnActive]}
                onPress={() => setDefaultQuality(q)}
              >
                <Text style={[styles.segBtnText, defaultQuality === q && styles.segBtnTextActive]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Player Selection: Internal vs VLC vs MX */}
        <View style={styles.pickerRow}>
          <Text style={styles.settingLabel}>{t('settings.playerSelection')}</Text>
          <View style={styles.segmentedControl}>
            {(['internal', 'vlc', 'mx', 'system'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.segBtn, defaultPlayer === p && styles.segBtnActive]}
                onPress={() => setDefaultPlayer(p)}
              >
                <Text style={[styles.segBtnText, defaultPlayer === p && styles.segBtnTextActive]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 3. Subtitles */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>💬 {t('settings.subtitles')}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelCol}>
            <Text style={styles.settingLabel}>تفعيل الترجمة التلقائية</Text>
            <Text style={styles.settingDesc}>إظهار الترجمة فور بدء الفيديو</Text>
          </View>
          <Switch
            value={subtitlesEnabled}
            onValueChange={setSubtitlesEnabled}
            trackColor={{ false: '#263042', true: colors.primary }}
          />
        </View>

        {/* Subtitle Font Size */}
        <View style={styles.pickerRow}>
          <Text style={styles.settingLabel}>{t('settings.subtitleSize')}</Text>
          <View style={styles.segmentedControl}>
            {(['small', 'medium', 'large'] as const).map((sz) => (
              <TouchableOpacity
                key={sz}
                style={[styles.segBtn, subSize === sz && styles.segBtnActive]}
                onPress={() => setSubSize(sz)}
              >
                <Text style={[styles.segBtnText, subSize === sz && styles.segBtnTextActive]}>
                  {sz === 'small' ? 'صغير' : sz === 'medium' ? 'متوسط' : 'كبير'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 4. Trakt.tv Cloud Sync */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>⚡ {t('settings.account')}</Text>

        <View style={styles.traktCard}>
          <View style={styles.traktHeaderRow}>
            <View>
              <Text style={styles.traktTitle}>Trakt.tv Cloud Sync</Text>
              <Text style={styles.traktStatus}>
                {traktState.isAuthenticated
                  ? `متصل: ${traktState.user?.username || 'CinemaLover'}`
                  : 'غير متصل (مزامنة السجل والمفضلة)'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.traktBtn,
                traktState.isAuthenticated ? styles.traktBtnLogout : styles.traktBtnLogin,
              ]}
              onPress={handleTraktToggle}
            >
              <Text style={styles.traktBtnText}>
                {traktState.isAuthenticated ? t('settings.traktLogout') : t('settings.traktLogin')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Library & Storage Clean */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>📂 {t('settings.downloads')}</Text>

        <TouchableOpacity style={styles.actionRow} onPress={handleClearHistory}>
          <Text style={styles.actionRowLabel}>مسح سجل المشاهدة (History)</Text>
          <Text style={styles.actionRowDelete}>مسح 🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* 6. About & Version */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ℹ {t('settings.about')}</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>رقم الإصدار</Text>
          <Text style={styles.aboutValue}>2.4.0 (Stable Official Build)</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>محرك البث</Text>
          <Text style={styles.aboutValue}>HDOFLIX Modular ExoPlayer v2</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>الأمان والخصوصية</Text>
          <Text style={styles.aboutValue}>SSL/HTTPS مشفر بالكامل ✓</Text>
        </View>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBanner: {
    padding: 20,
    backgroundColor: '#121620',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2636',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8A97AC',
    fontSize: 12,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#171E2B',
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  subHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  langPills: {
    gap: 8,
  },
  langPill: {
    backgroundColor: '#141824',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242D40',
  },
  langPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langPillText: {
    color: '#8A97AC',
    fontSize: 12,
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  settingLabelCol: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  settingDesc: {
    color: '#76859B',
    fontSize: 11,
    marginTop: 2,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#10141D',
    borderRadius: borderRadius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: '#202838',
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  segBtnActive: {
    backgroundColor: colors.primary,
  },
  segBtnText: {
    color: '#76859B',
    fontSize: 11,
    fontWeight: '700',
  },
  segBtnTextActive: {
    color: '#FFFFFF',
  },
  traktCard: {
    backgroundColor: '#141822',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#222A3B',
  },
  traktHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traktTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  traktStatus: {
    color: '#ED1C24',
    fontSize: 11,
    marginTop: 2,
  },
  traktBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  traktBtnLogin: {
    backgroundColor: '#ED1C24',
  },
  traktBtnLogout: {
    backgroundColor: '#263042',
  },
  traktBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141822',
    padding: 12,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#222A3B',
  },
  actionRowLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRowDelete: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  aboutLabel: {
    color: '#76859B',
    fontSize: 12,
  },
  aboutValue: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
});
