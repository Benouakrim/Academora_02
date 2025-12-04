import { useState } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveComparison } from '@/hooks/useCompare';

interface SaveComparisonDialogProps {
  universityIds: string[];
  disabled?: boolean;
}

export function SaveComparisonDialog({
  universityIds,
  disabled,
}: SaveComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: saveComparison, isPending } = useSaveComparison();

  const handleSave = () => {
    if (!name.trim()) return;

    saveComparison(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        universityIds,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setDescription('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || universityIds.length < 2}>
          <Save className="mr-2 h-4 w-4" />
          Save Comparison
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Comparison</DialogTitle>
          <DialogDescription>
            Save this comparison to access it later from your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Comparison Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Top Engineering Schools"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about why you're comparing these schools..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Saving {universityIds.length} {universityIds.length === 1 ? 'university' : 'universities'}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isPending}
          >
            {isPending ? 'Saving...' : 'Save Comparison'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
