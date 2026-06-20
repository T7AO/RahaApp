import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useColors } from '@/hooks/useColors';

const BLOG_POSTS = [
  {
    id: 'b1',
    title: 'Understanding Hypertension: What You Need to Know',
    category: 'Cardiology',
    readMin: 4,
    color: '#1A73E8',
    icon: 'heart' as const,
  },
  {
    id: 'b2',
    title: 'Smart Nutrition Tips for a Healthier Lifestyle',
    category: 'Nutrition',
    readMin: 3,
    color: '#27AE60',
    icon: 'coffee' as const,
  },
  {
    id: 'b3',
    title: 'Managing Diabetes at Home: A Complete Guide',
    category: 'Diabetes',
    readMin: 5,
    color: '#F59E0B',
    icon: 'droplet' as const,
  },
  {
    id: 'b4',
    title: 'Mental Wellness: Building Resilience Every Day',
    category: 'Mental Health',
    readMin: 4,
    color: '#8B5CF6',
    icon: 'sun' as const,
  },
];

export function HomeBlog() {
  const colors = useColors();

  return (
    <View>
      <SectionHeader title="Health Blog" />
      <View style={styles.list}>
        {BLOG_POSTS.map(post => (
          <Pressable
            key={post.id}
            onPress={() => Alert.alert(post.title, 'Full article coming soon.')}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={[styles.thumb, { backgroundColor: `${post.color}14` }]}>
              <Feather name={post.icon} size={26} color={post.color} />
            </View>
            <View style={styles.meta}>
              <View style={[styles.catChip, { backgroundColor: `${post.color}12` }]}>
                <Text style={[styles.cat, { color: post.color }]}>{post.category}</Text>
              </View>
              <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
                {post.title}
              </Text>
              <Text style={[styles.read, { color: colors.mutedForeground }]}>{post.readMin} min read</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumb: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, gap: 5 },
  catChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  cat: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  title: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  read: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
