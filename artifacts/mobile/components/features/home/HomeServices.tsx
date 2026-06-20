import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceActionCard } from '@/components/features/ServiceActionCard';
import colors from '@/constants/colors';

const SERVICES = [
  {
    icon: 'video' as const,
    title: 'Virtual Consultation',
    subtitle: 'Talk to a doctor online',
    route: '/virtual-consultation' as const,
    color: colors.roles.patient,
  },
  {
    icon: 'home' as const,
    title: 'Home Visit',
    subtitle: 'Doctor or nurse comes to you',
    route: '/home-visit' as const,
    color: '#4A9D8F',
  },
  {
    icon: 'map-pin' as const,
    title: 'Book Clinic Appointment',
    subtitle: 'Visit one of our Raha clinics',
    route: '/clinic' as const,
    color: '#2E86AB',
  },
];

export function HomeServices() {
  const router = useRouter();

  return (
    <View>
      <SectionHeader title="Our Services" />
      <View style={{ gap: 10 }}>
        {SERVICES.map(service => (
          <ServiceActionCard
            key={service.title}
            icon={service.icon}
            title={service.title}
            subtitle={service.subtitle}
            color={service.color}
            onPress={() => router.push(service.route)}
          />
        ))}
      </View>
    </View>
  );
}
