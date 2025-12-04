import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchStore } from '@/store/useSearchStore';

/**
 * Limit Input Component
 * Allows users to control the number of results per page (1-50)
 * Automatically resets to page 1 when limit changes
 */
export default function LimitInput() {
  const { criteria, setLimit } = useSearchStore();
  const limit = criteria.limit;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input for better UX during typing
    if (value === '') {
      return;
    }

    const numValue = parseInt(value, 10);
    
    // Validate range: 1-50
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setLimit(numValue);
    }
  };

  const handleBlur = () => {
    // On blur, ensure we have a valid value
    if (!limit || limit < 1) {
      setLimit(20); // Reset to default
    } else if (limit > 50) {
      setLimit(50); // Cap at maximum
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="limit-input" className="text-sm whitespace-nowrap">
        Per page:
      </Label>
      <Input
        id="limit-input"
        type="number"
        min="1"
        max="50"
        value={limit}
        onChange={handleChange}
        onBlur={handleBlur}
        className="h-9 w-20"
        aria-label="Results per page"
      />
    </div>
  );
}
