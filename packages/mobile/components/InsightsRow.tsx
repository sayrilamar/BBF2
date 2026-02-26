import { Box, Text } from '../theme/primitives';

type InsightCardProps = {
  label: string;
  value: string;
  badge?: string;
};

function InsightCard({ label, value, badge }: InsightCardProps) {
  return (
    <Box
      backgroundColor="card"
      borderRadius="l"
      padding="l"
      marginRight="m"
      width={165}
    >
      <Text variant="label">{label}</Text>
      <Text variant="stat" marginTop="s">
        {value}
      </Text>
      {badge ? (
        <Box marginTop="m" backgroundColor="primaryMuted" alignSelf="flex-start" borderRadius="m" paddingHorizontal="m" paddingVertical="s">
          <Text color="primary" fontWeight="700">
            {badge}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}

export function InsightsRow() {
  return (
    <Box flexDirection="row" marginTop="xl">
      <InsightCard label="Lowest ValueScore" value="$412" badge="5h 10m" />
      <InsightCard label="Best Price" value="$356" badge="7h 05m" />
    </Box>
  );
}
