import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

/**
 * SVG tab icons matching дизайн.html TabBar.
 * 4 tabs: Үй, Пәндер, ҰБТ, Профиль
 */
function TabIcon({ icon, label, focused }: { icon: React.ReactNode; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      {icon}
      <View>
        <Svg width={0} height={0}><Path d="" /></Svg>
      </View>
    </View>
  );
}

function HomeIcon({ focused }: { focused: boolean }) {
  const color = focused ? Colors.primary : Colors.ink3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12L12 4l9 8v8a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8z"
        stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function SubjectsIcon({ focused }: { focused: boolean }) {
  const color = focused ? Colors.primary : Colors.ink3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
        stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function UBTIcon({ focused }: { focused: boolean }) {
  const color = focused ? Colors.primary : Colors.ink3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 8l10 6 10-6-10-6zM2 16l10 6 10-6M2 12l10 6 10-6"
        stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? Colors.primary : Colors.ink3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 1116 0H4z"
        stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.ink3,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItemWrapper,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Үй',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <HomeIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          tabBarLabel: 'Пәндер',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <SubjectsIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ubt"
        options={{
          tabBarLabel: 'ҰБТ',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <UBTIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <ProfileIcon focused={focused} />
            </View>
          ),
        }}
      />
      {/* Hide leaderboard from tabs but keep file for direct navigation */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    height: 85,
    paddingBottom: 26,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItemWrapper: {
    gap: 3,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: Colors.primarySoft,
  },
  iconWrap: {
    padding: 4,
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: Colors.primarySoft,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
