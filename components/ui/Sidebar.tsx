import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../store/appStore';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Character, Campaign } from '../../types';
import { DEFAULT_SCHEME } from '../../constants/colorSchemes';

const SIDEBAR_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);
const SLIDE_DURATION = 230;
const FADE_DURATION = 200;

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onSettings: () => void;
  onDiceRolls: () => void;
  onRules: () => void;
}

export default function Sidebar({
  visible,
  onClose,
  onNewGame,
  onSettings,
  onDiceRolls,
  onRules,
}: Props) {
  const { characters, campaigns, setActive, activeCharacterId, activeCampaignId } =
    useAppStore();

  const scheme = COLOR_SCHEMES[DEFAULT_SCHEME];

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const charList = Object.values(characters).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
  const campList = Object.values(campaigns).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const standaloneChars = charList.filter((c) => !c.campaignId);
  const standaloneCamps = campList.filter((c) => !c.characterId);
  const pairedEntries: Array<{ char: Character; camp: Campaign }> = charList
    .filter((c) => c.campaignId)
    .map((c) => ({ char: c, camp: campaigns[c.campaignId!] }))
    .filter((e) => !!e.camp);

  const handleSelectChar = (charId: string, campId: string | null = null) => {
    setActive(charId, campId);
    onClose();
  };

  const handleSelectCamp = (campId: string) => {
    setActive(null, campId);
    onClose();
  };

  const renderDot = (active: boolean, color: string) => (
    <View
      style={[
        styles.activeDot,
        { backgroundColor: active ? color : 'transparent' },
      ]}
    />
  );

  return (
    <Animated.View
      style={[styles.root, { opacity: backdropOpacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop tap-to-close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Sliding panel */}
      <Animated.View
        style={[styles.sidebar, { width: SIDEBAR_WIDTH, transform: [{ translateX }] }]}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={[styles.sidebarInner, { backgroundColor: 'rgba(10,14,30,0.82)' }]}>
          {/* App Name */}
          <View style={styles.appHeader}>
            <Text style={styles.appName}>Viator</Text>
            <Text style={styles.appSubtitle}>Character Builder</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

          {/* Nav Buttons */}
          <NavItem icon="✦" label="New Game" onPress={onNewGame} />
          <NavItem icon="⚄" label="Dice Roller" onPress={onDiceRolls} />
          <NavItem icon="📖" label="Rules Reference" onPress={onRules} />
          <NavItem icon="⚙" label="Settings" onPress={onSettings} />

          <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />

          <ScrollView style={styles.entryList} showsVerticalScrollIndicator={false}>
            {/* Paired */}
            {pairedEntries.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Characters & Campaigns</Text>
                {pairedEntries.map(({ char, camp }) => {
                  const cs = COLOR_SCHEMES[char.colorScheme];
                  const isActive =
                    activeCharacterId === char.id && activeCampaignId === camp.id;
                  return (
                    <TouchableOpacity
                      key={char.id}
                      onPress={() => handleSelectChar(char.id, camp.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entryName}>{char.name}</Text>
                        <Text style={styles.entrySub}>{camp.name}</Text>
                      </View>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Standalone Characters */}
            {standaloneChars.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Characters</Text>
                {standaloneChars.map((char) => {
                  const cs = COLOR_SCHEMES[char.colorScheme];
                  const isActive = activeCharacterId === char.id;
                  return (
                    <TouchableOpacity
                      key={char.id}
                      onPress={() => handleSelectChar(char.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <Text style={[styles.entryName, { flex: 1 }]}>{char.name}</Text>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Standalone Campaigns */}
            {standaloneCamps.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Campaigns</Text>
                {standaloneCamps.map((camp) => {
                  const cs = COLOR_SCHEMES[camp.colorScheme];
                  const isActive = activeCampaignId === camp.id;
                  return (
                    <TouchableOpacity
                      key={camp.id}
                      onPress={() => handleSelectCamp(camp.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <Text style={[styles.entryName, { flex: 1 }]}>{camp.name}</Text>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {charList.length === 0 && campList.length === 0 && (
              <Text style={styles.emptyHint}>Tap New Game to get started.</Text>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function NavItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem} activeOpacity={0.7}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: 'rgba(100,140,255,0.15)',
  },
  sidebarInner: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  appHeader: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e8eeff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: 'rgba(160,180,224,0.7)',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  navIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    color: 'rgba(160,180,224,0.8)',
  },
  navLabel: {
    fontSize: 15,
    color: '#e8eeff',
    fontWeight: '500',
  },
  entryList: {
    flex: 1,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(160,180,224,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e8eeff',
  },
  entrySub: {
    fontSize: 11,
    color: 'rgba(160,180,224,0.6)',
    marginTop: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyHint: {
    color: 'rgba(160,180,224,0.4)',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 12,
  },
});
