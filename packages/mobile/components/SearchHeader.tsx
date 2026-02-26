import { Pressable } from 'react-native';

import { Box, Text } from '../theme/primitives';

export function SearchHeader() {
  return (
    <Box>
      <Text variant="label">Today</Text>
      <Text variant="hero" marginTop="s">
        Find flights by
        {'\n'}best value
      </Text>
      <Text variant="body" marginTop="m">
        Modern ranking that balances price and trip duration across providers.
      </Text>
      <Pressable>
        <Box
          marginTop="l"
          alignSelf="flex-start"
          backgroundColor="primary"
          paddingHorizontal="l"
          paddingVertical="m"
          borderRadius="xl"
        >
          <Text color="textPrimary" fontWeight="700">
            Start search
          </Text>
        </Box>
      </Pressable>
    </Box>
  );
}
