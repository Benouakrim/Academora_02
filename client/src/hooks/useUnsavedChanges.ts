import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBeforeUnload } from 'react-router-dom';

export function useUnsavedChanges() {
  const form = useFormContext();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!form) return;

    const subscription = form.watch(() => {
      setIsDirty(form.formState.isDirty);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    if (isDirty) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isDirty]);

  return { isDirty };
}
