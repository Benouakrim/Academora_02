import { Grid3x3, List, Map } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSearchStore } from '@/store/useSearchStore';

/**
 * ViewToggle Component
 * Allows users to switch between CARD, LIST, and MAP views
 */
export default function ViewToggle() {
  const { viewType, setViewType } = useSearchStore();

  return (
    <ToggleGroup
      type="single"
      value={viewType}
      onValueChange={(value) => {
        if (value) {
          setViewType(value as 'CARD' | 'LIST' | 'MAP');
        }
      }}
      className="border rounded-lg"
      aria-label="View type toggle"
    >
      <ToggleGroupItem
        value="CARD"
        aria-label="Card view"
        className="gap-2"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="LIST"
        aria-label="List view"
        className="gap-2"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="MAP"
        aria-label="Map view"
        className="gap-2"
      >
        <Map className="h-4 w-4" />
        <span className="hidden sm:inline">Map</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
