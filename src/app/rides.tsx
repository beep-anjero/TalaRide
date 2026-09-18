import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { BottomNav } from '@/components/BottomNav';
import { RideRow } from '@/components/RideRow';
import { Copy, Field, Icon, Title, s } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { colors } from '@/constants/theme';
import { useMock } from '@/mocks/MockProvider';
import type { IdentifierType } from '@/types/models';

export default function RidesScreen() {
  const { rides } = useMock();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<IdentifierType | 'All'>('All');
  const [showFilter, setShowFilter] = useState(false);
  const query = search.trim().toLowerCase();
  const items = rides.filter(
    (ride) =>
      (filter === 'All' || ride.identifier === filter) &&
      [ride.number, ride.note, ride.location].some((value) => value.toLowerCase().includes(query)),
  );
  return (
    <Screen scroll={false} footer={<BottomNav active="Rides" />}>
      <Title style={{ marginBottom: 12 }}>My Rides</Title>
      <View style={[s.row, { gap: 10, marginBottom: 8 }]}>
        <View style={{ flex: 1 }}>
          <Field
            label="Search rides"
            placeholder="Search rides..."
            icon="search-outline"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter rides"
          onPress={() => setShowFilter(true)}
          style={{
            backgroundColor: colors.field,
            minWidth: 46,
            minHeight: 50,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="filter-outline" color={filter === 'All' ? colors.ink : colors.green} />
        </Pressable>
      </View>
      <FlatList
        style={{ flex: 1, minHeight: 0 }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideRow ride={item} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 12 }}
        ListEmptyComponent={
          <Copy style={{ paddingVertical: 24, textAlign: 'center', color: colors.muted }}>
            {rides.length
              ? 'No rides match your search or filter.'
              : 'No rides yet. Scan a vehicle to begin.'}
          </Copy>
        }
      />
      {showFilter && (
        <Notice
          title="Filter rides"
          message="Choose the vehicle identifier type."
          onClose={() => setShowFilter(false)}
        >
          {(['All', 'MTOP', 'Body #', 'Plate #'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={value}
              accessibilityState={{ checked: filter === value }}
              onPress={() => {
                setFilter(value);
                setShowFilter(false);
              }}
              style={[s.row, { minHeight: 44 }]}
            >
              <Icon
                name={filter === value ? 'radio-button-on' : 'radio-button-off'}
                color={colors.green}
              />
              <Copy>{value}</Copy>
            </Pressable>
          ))}
        </Notice>
      )}
    </Screen>
  );
}
