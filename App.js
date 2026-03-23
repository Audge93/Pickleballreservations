import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CourtViewScreen from './src/screens/CourtViewScreen';
import SlotDetailScreen from './src/screens/SlotDetailScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { colors } from './src/theme/colors';
import { initialUser, dayTabs } from './src/data/mockData';
import { subscribeToSlots, upsertUser } from './src/firebase/slots';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ user, slots, selectedDate, setSelectedDate }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: '#7B8794',
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: colors.border,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'ellipse';
          if (route.name === 'CourtViewTab') iconName = focused ? 'calendar' : 'calendar-outline';
          if (route.name === 'BookingsTab') iconName = focused ? 'clipboard' : 'clipboard-outline';
          if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="CourtViewTab" options={{ title: 'Court View' }}>
        {() => (
          <CourtViewScreen
            user={user}
            slots={slots}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dayTabs={dayTabs}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="BookingsTab" options={{ title: 'Bookings' }}>
        {() => <BookingsScreen user={user} slots={slots} selectedDate={selectedDate} />}
      </Tab.Screen>
      <Tab.Screen name="ProfileTab" options={{ title: 'Profile' }}>
        {() => <ProfileScreen user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayTabs[0].date);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const isOnboarded = useMemo(
    () => Boolean(user?.firstName && user?.skillLevel && user?.id),
    [user]
  );

  useEffect(() => {
    const unsubscribe = subscribeToSlots(
      (nextSlots) => {
        setSlots(nextSlots);
        setLoadingSlots(false);
      },
      (error) => {
        console.error('Slot subscription failed:', error);
        Alert.alert('Firebase error', 'Could not load Firestore slots. Check your Firebase config and seeded data.');
        setLoadingSlots(false);
      }
    );

    return unsubscribe;
  }, []);

  if (!hasSeenSplash || loadingSlots) {
    return <SplashScreen onDone={() => setHasSeenSplash(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {({ navigation }) => (
              <OnboardingScreen
                onComplete={async (newUser) => {
                  await upsertUser(newUser);
                  setUser(newUser);
                  navigation.replace('Main');
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => (
                <MainTabs
                  user={user}
                  slots={slots}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SlotDetail">
              {({ route, navigation }) => (
                <SlotDetailScreen
                  route={route}
                  navigation={navigation}
                  user={user}
                  slots={slots}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
