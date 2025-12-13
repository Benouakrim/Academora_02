// client/src/components/admin/DuplicateBlockModal.tsx

import { useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UniversityAutocomplete } from '@/components/claims/UniversityAutocomplete';
import { toast } from 'sonner';

interface UniversitySelect {
  id: string;
  name: string;
}

interface SourceBlock {
  id: string;
  title: string;
}

type DuplicateMutation = UseMutationResult<
  unknown,
  unknown,
  { sourceBlockId: string; targetUniversityIds: string[] },
  unknown
>;

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceBlock: SourceBlock;
  duplicateMutation: DuplicateMutation;
}

export function DuplicateBlockModal({
  isOpen,
  onClose,
  sourceBlock,
  duplicateMutation,
}: DuplicateModalProps) {
  const [targetUniversities, setTargetUniversities] = useState<UniversitySelect[]>([]);
  const [autocompleteKey, setAutocompleteKey] = useState<number>(0);

  const handleDuplicate = () => {
    if (!sourceBlock.id || targetUniversities.length === 0) {
      toast.error('Please select a source block and at least one target university.');
      return;
    }

    const targetUniversityIds = targetUniversities.map(uni => uni.id);

    duplicateMutation.mutate(
      {
        sourceBlockId: sourceBlock.id,
        targetUniversityIds: targetUniversityIds,
      },
      {
        onSuccess: () => {
          setTargetUniversities([]);
          setAutocompleteKey((k) => k + 1); // reset the autocomplete component
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Duplicate Block: "{sourceBlock.title}"</DialogTitle>
          <DialogDescription>
            Select the universities where you want to copy this block. A copy will be created for each selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="university-select" className="text-sm font-medium mb-2 block">
              Target Universities
            </Label>
            <UniversityAutocomplete
              key={autocompleteKey}
              onChange={(id, name) => {
                if (!id) return;
                setTargetUniversities((prev) => {
                  if (prev.some((u) => u.id === id)) return prev;
                  return [...prev, { id, name }];
                });
                setAutocompleteKey((k) => k + 1); // remount to allow next selection
              }}
              placeholder="Search and select a university..."
            />

            {targetUniversities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {targetUniversities.map((uni) => (
                  <span
                    key={uni.id}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm border border-blue-200"
                  >
                    {uni.name}
                    <button
                      type="button"
                      className="text-blue-700 hover:text-blue-900"
                      onClick={() =>
                        setTargetUniversities((prev) => prev.filter((u) => u.id !== uni.id))
                      }
                      aria-label={`Remove ${uni.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600">
            You are about to copy this block to
            <span className="font-semibold text-blue-600"> {targetUniversities.length} </span>
            other university profile{targetUniversities.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={duplicateMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={targetUniversities.length === 0 || duplicateMutation.isPending}
          >
            {duplicateMutation.isPending
              ? 'Copying...'
              : `Copy to ${targetUniversities.length} Profile${targetUniversities.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
