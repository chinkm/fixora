import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type SeekerStackParamList = {
  SeekerHome: undefined;
};

const Stack = createNativeStackNavigator<SeekerStackParamList>();

const categories = [
  { id: '1', icon: '🔧', name: 'Repair' },
  { id: '2', icon: '🧹', name: 'Cleaning' },
  { id: '3', icon: '🌿', name: 'Gardening' },
  { id: '4', icon: '💻', name: 'Tech Help' },
  { id: '5', icon: '📚', name: 'Tutoring' },
  { id: '6', icon: '＋', name: 'Others' },
];

const providerCarousel = [
  {
    id: '1',
    name: "Ahmad's Home Repair",
    rating: '4.9',
    reviews: '128',
    skills: 'Plumbing • Electrical • General Repair',
    summary: 'Reliable home repair and maintenance services for everyday household problems.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  },
  {
    id: '2',
    name: 'Clean & Care Services',
    rating: '4.8',
    reviews: '96',
    skills: 'Home Cleaning • Deep Cleaning',
    summary: 'Professional home cleaning services with flexible scheduling for busy families.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  },
  {
    id: '3',
    name: 'Green Garden Experts',
    rating: '4.9',
    reviews: '74',
    skills: 'Gardening • Landscaping • Lawn Care',
    summary: 'Keep your garden healthy and beautiful with experienced local gardeners.',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800',
  },
  {
    id: '4',
    name: 'Tech Buddy Services',
    rating: '4.7',
    reviews: '61',
    skills: 'Computer Help • Wi-Fi • Device Setup',
    summary: 'Friendly technical assistance for computers, home networks and everyday devices.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  },
];

const recommendedProviders = [
  {
    id: 'r1',
    name: "Ahmad's Home Repair",
    rating: '4.9',
    reviews: '128',
    skills: 'Plumbing • Electrical • General Repair',
    summary: 'Reliable home repair and maintenance services for everyday household problems.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  },
  {
    id: 'r2',
    name: 'Clean & Care Services',
    rating: '4.8',
    reviews: '96',
    skills: 'Home Cleaning • Deep Cleaning',
    summary: 'Professional home cleaning services with flexible scheduling for busy families.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  },
  {
    id: 'r3',
    name: 'Green Garden Experts',
    rating: '4.9',
    reviews: '74',
    skills: 'Gardening • Landscaping • Lawn Care',
    summary: 'Keep your garden healthy and beautiful with experienced local gardeners.',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800',
  },
  {
    id: 'r4',
    name: 'Tech Buddy Services',
    rating: '4.7',
    reviews: '61',
    skills: 'Computer Help • Wi-Fi • Device Setup',
    summary: 'Friendly technical assistance for computers, home networks and everyday devices.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  },
];

const CAROUSEL_INTERVAL = 4000;

function SeekerHomeScreen() {
  const { user } = useAuth();

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'there';

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  const carouselRef = useRef<FlatList<(typeof providerCarousel)[number]>>(null);

  /*
   * Auto-play timer.
   *
   * It stops while the user is holding the carousel card.
   * It also stops while the carousel is being manually interacted with.
   */
  useEffect(() => {
    if (isCarouselPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCarouselIndex((currentIndex) => {
        const nextIndex = currentIndex === providerCarousel.length - 1 ? 0 : currentIndex + 1;

        carouselRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(timer);
  }, [isCarouselPaused]);

  const handleCarouselViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const firstVisibleItem = viewableItems[0];

      if (firstVisibleItem?.index != null) {
        setCarouselIndex(firstVisibleItem.index);
      }
    },
  ).current;

  const carouselViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  /*
   * This is our first version of the "Interaction Observer".
   *
   * For now we only prove that React Native can tell us when a
   * recommendation becomes visible. Later this can call our API.
   */
  const observedRecommendedProviderIds = useRef(new Set<string>()).current;

  const handleRecommendedViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{
        item: (typeof recommendedProviders)[number];
        index: number | null;
      }>;
    }) => {
      viewableItems.forEach((viewableItem) => {
        if (viewableItem.index == null) return;

        const providerId = viewableItem.item.id;

        if (observedRecommendedProviderIds.has(providerId)) {
          return;
        }

        observedRecommendedProviderIds.add(providerId);

        console.log('Provider impression:', viewableItem.item.name);
      });
    },
  ).current;

  const recommendedViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;

  const renderRecommendedProvider = useCallback(
    ({ item }: ListRenderItemInfo<(typeof recommendedProviders)[number]>) => {
      return (
        <Pressable
          style={styles.recommendedCard}
          onPress={() => {
            console.log('Provider selected:', item.name);
          }}
        >
          <Image source={{ uri: item.image }} style={styles.recommendedImage} />

          <View style={styles.recommendedBody}>
            <View style={styles.providerRatingRow}>
              <Text style={styles.rating}>⭐ {item.rating}</Text>

              <Text style={styles.reviewCount}>({item.reviews} reviews)</Text>
            </View>

            <Text style={styles.providerName}>{item.name}</Text>

            <Text style={styles.providerSkills} numberOfLines={1}>
              {item.skills}
            </Text>

            <Text style={styles.providerSummary} numberOfLines={2}>
              {item.summary}
            </Text>

            <View style={styles.providerButton}>
              <Text style={styles.providerButtonText}>View Service</Text>
            </View>
          </View>
        </Pressable>
      );
    },
    [],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={recommendedProviders}
        keyExtractor={(item) => item.id}
        renderItem={renderRecommendedProvider}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onViewableItemsChanged={handleRecommendedViewableItemsChanged}
        viewabilityConfig={recommendedViewabilityConfig}
        ListHeaderComponent={
          <>
            {/* Identity */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good morning 👋</Text>

                <Text style={styles.name}>{displayName}</Text>
              </View>

              <Pressable style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </Pressable>
            </View>

            {/* Search */}
            <Pressable style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔎</Text>

              <Text style={styles.searchPlaceholder}>What service do you need?</Text>
            </Pressable>

            {/* AI Camera */}
            <Pressable style={styles.aiCameraCard}>
              <View style={styles.aiCameraIcon}>
                <Text style={styles.aiCameraEmoji}>📷</Text>
              </View>

              <View style={styles.aiCameraContent}>
                <Text style={styles.aiCameraTitle}>Search with AI Camera</Text>

                <Text style={styles.aiCameraDescription}>
                  Take a photo of your problem and let Fixora help you find a solution.
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Categories */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>

              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <Pressable style={styles.categoryCard}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>

                  <Text style={styles.categoryName}>{item.name}</Text>
                </Pressable>
              )}
            />

            {/* Provider Discovery Carousel */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Discover Services</Text>

                <Text style={styles.sectionSubtitle}>Explore Fixora providers</Text>
              </View>

              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <FlatList
              ref={carouselRef}
              data={providerCarousel}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              decelerationRate="fast"
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.providerList}
              onViewableItemsChanged={handleCarouselViewableItemsChanged}
              viewabilityConfig={carouselViewabilityConfig}
              onScrollBeginDrag={() => {
                setIsCarouselPaused(true);
              }}
              onScrollEndDrag={() => {
                setIsCarouselPaused(false);
              }}
              onMomentumScrollEnd={() => {
                setIsCarouselPaused(false);
              }}
              getItemLayout={(_, index) => ({
                length: 310 + spacing.md,
                offset: (310 + spacing.md) * index,
                index,
              })}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.providerCard}
                  onPress={() => {
                    console.log('Provider selected:', item.name);
                  }}
                  onPressIn={() => {
                    setIsCarouselPaused(true);
                  }}
                  onPressOut={() => {
                    setIsCarouselPaused(false);
                  }}
                >
                  <Image source={{ uri: item.image }} style={styles.providerImage} />

                  <View style={styles.providerBody}>
                    <View style={styles.providerRatingRow}>
                      <Text style={styles.rating}>⭐ {item.rating}</Text>

                      <Text style={styles.reviewCount}>({item.reviews} reviews)</Text>
                    </View>

                    <Text style={styles.providerName}>{item.name}</Text>

                    <Text style={styles.providerSkills} numberOfLines={1}>
                      {item.skills}
                    </Text>

                    <Text style={styles.providerSummary} numberOfLines={2}>
                      {item.summary}
                    </Text>

                    <View style={styles.providerButton}>
                      <Text style={styles.providerButtonText}>View Service</Text>
                    </View>
                  </View>
                </Pressable>
              )}
            />

            {/* Carousel Indicators */}
            <View style={styles.carouselIndicators}>
              {providerCarousel.map((provider, index) => (
                <View
                  key={provider.id}
                  style={[styles.carouselDot, index === carouselIndex && styles.carouselDotActive]}
                />
              ))}
            </View>

            {/* Recommended Section Header */}
            <View style={styles.recommendedHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recommended for You</Text>

                <Text style={styles.sectionSubtitle}>Services that may interest you</Text>
              </View>

              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.engagementSection}>
            <Text style={styles.sectionTitle}>Your activity</Text>

            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Text>💬</Text>
              </View>

              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Messages</Text>

                <Text style={styles.activityDescription}>
                  Your provider conversations will appear here.
                </Text>
              </View>

              <Text style={styles.activityArrow}>›</Text>
            </View>

            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Text>🔔</Text>
              </View>

              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Notifications</Text>

                <Text style={styles.activityDescription}>
                  Stay updated about your jobs and requests.
                </Text>
              </View>

              <Text style={styles.activityArrow}>›</Text>
            </View>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <BottomTab icon="🏠" label="Home" active />
        <BottomTab icon="📋" label="Jobs" />
        <BottomTab icon="💬" label="Chat" />
        <BottomTab icon="👤" label="Profile" />
      </View>
    </View>
  );
}

type BottomTabProps = {
  icon: string;
  label: string;
  active?: boolean;
};

function BottomTab({ icon, label, active = false }: BottomTabProps) {
  return (
    <Pressable style={styles.bottomTab}>
      <Text style={[styles.bottomTabIcon, active && styles.bottomTabIconActive]}>{icon}</Text>

      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function SeekerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SeekerHome"
        component={SeekerHomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  greeting: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  name: {
    ...typography.h3,
    color: colors.text,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  searchContainer: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  searchPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
  },

  aiCameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.primary,
    marginBottom: spacing.xl,
  },

  aiCameraIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiCameraEmoji: {
    fontSize: 23,
  },

  aiCameraContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  aiCameraTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },

  aiCameraDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFF',
  },

  chevron: {
    fontSize: 28,
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  categoryList: {
    paddingBottom: spacing.xl,
  },

  categoryCard: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  categoryIcon: {
    fontSize: 27,
    marginBottom: spacing.xs,
  },

  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  providerList: {
    paddingBottom: spacing.sm,
  },

  providerCard: {
    width: 310,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: spacing.md,
  },

  providerImage: {
    width: '100%',
    height: 155,
  },

  providerBody: {
    padding: spacing.md,
  },

  providerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  reviewCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  providerName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  providerSkills: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },

  providerSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    minHeight: 38,
  },

  providerButton: {
    marginTop: spacing.md,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },

  providerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },

  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },

  carouselDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },

  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },

  recommendedCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },

  recommendedImage: {
    width: '100%',
    height: 170,
  },

  recommendedBody: {
    padding: spacing.md,
  },

  engagementSection: {
    marginTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  activityDescription: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },

  activityArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },

  bottomTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },

  bottomTabIcon: {
    fontSize: 21,
    opacity: 0.55,
    marginBottom: 3,
  },

  bottomTabIconActive: {
    opacity: 1,
  },

  bottomTabLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },

  bottomTabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
