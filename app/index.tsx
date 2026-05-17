import { Redirect } from 'expo-router';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOnboarded } = useStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Жүктелуде..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
