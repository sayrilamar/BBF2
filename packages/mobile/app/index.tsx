import { SafeAreaView } from 'react-native-safe-area-context';

import { InsightsRow } from '../components/InsightsRow';
import { SearchHeader } from '../components/SearchHeader';
import { Box, Text } from '../theme/primitives';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} padding="xl" backgroundColor="background">
        <SearchHeader />

        <InsightsRow />

        <Box marginTop="xxl" backgroundColor="card" borderRadius="l" padding="l">
          <Text variant="title">Ranking transparency</Text>
          <Text variant="body" marginTop="m">
            ValueScore = TotalPrice + (DurationHours × TimeValuePerHour)
          </Text>
          <Text variant="body" marginTop="s">
            Default TimeValuePerHour is $30 and can be adjusted before searching.
          </Text>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
