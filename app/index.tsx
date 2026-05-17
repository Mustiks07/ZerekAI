import { Redirect } from 'expo-router';
import { useStore } from '@/store/useStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isOnboarded } = useStore();

  // For MVP with mock data, always go to tabs
  // When Supabase is connected, this will check auth state
  return <Redirect href="/(tabs)" />;
}
