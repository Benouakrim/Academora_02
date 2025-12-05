import { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { toast } from 'sonner';

interface UseAutosaveOptions {
  onSave: (data: any) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function useAutosave({ onSave, interval = 30000, enabled = true }: UseAutosaveOptions) {
  const form = useFormContext();
  const isSaving = useRef(false);
  const lastSavedData = useRef<string>('');

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      if (isSaving.current) return;

      const currentData = JSON.stringify(data);
      if (currentData === lastSavedData.current) return;

      isSaving.current = true;
      try {
        await onSave(data);
        lastSavedData.current = currentData;
        toast.success('Autosaved', { duration: 1500 });
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        isSaving.current = false;
      }
    }, 2000),
    [onSave]
  );

  // Watch form changes
  useEffect(() => {
    if (!enabled || !form) return;

    const subscription = form.watch((data) => {
      debouncedSave(data);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [form, debouncedSave, enabled]);

  // Interval-based autosave
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      const data = form.getValues();
      if (!isSaving.current) {
        debouncedSave(data);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [form, debouncedSave, interval, enabled]);

  return { isSaving: isSaving.current };
}
