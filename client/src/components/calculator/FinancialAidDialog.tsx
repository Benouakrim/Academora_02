import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
// No Switch in sheet, use native checkbox
import { CostChart } from './CostChart';
import { useFinancialAid } from '../../hooks/useFinancialAid';
import { useUserStore } from '../../store/useUserStore';

interface FinancialAidDialogProps {
  universityId: string;
  isOpen: boolean;
  onClose: () => void;
  stickerPrice?: number; // Optionally pass sticker price for chart
}

type FormValues = {
  income: number;
  gpa: number;
  sat?: number;
  inState: boolean;
};

export const FinancialAidDialog: React.FC<FinancialAidDialogProps> = ({ universityId, isOpen, onClose, stickerPrice }) => {
  const user = useUserStore((s) => s.profile);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      income: user?.income || '',
      gpa: user?.gpa || '',
      sat: user?.sat || '',
      inState: user?.inState || false,
    },
  });

  // Autofill on open
  React.useEffect(() => {
    if (isOpen && user) {
      setValue('income', user.income || '');
      setValue('gpa', user.gpa || '');
      setValue('sat', user.sat || '');
      setValue('inState', user.inState || false);
    }
    if (!isOpen) {
      reset();
    }
  }, [isOpen, user, setValue, reset]);

  const { mutate, data, isPending, error, reset: resetMutation } = useFinancialAid();

  const onSubmit = (values: FormValues) => {
    mutate({
      universityId,
      income: Number(values.income),
      gpa: Number(values.gpa),
      sat: values.sat ? Number(values.sat) : undefined,
      inState: values.inState,
    });
  };

  // Chart data
  const chartSticker = useMemo(() => data?.stickerPrice || stickerPrice || 50000, [data, stickerPrice]);
  const chartAid = useMemo(() => (data ? data.stickerPrice - data.netPrice : 0), [data]);
  const chartNet = useMemo(() => data?.netPrice || 0, [data]);

  // Reset dialog state on close
  const handleClose = () => {
    reset();
    resetMutation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle>Financial Aid Calculator</DialogTitle>
      <DialogContent>
        {!data && !isPending && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label>Family Income</label>
              <Input type="number" step="1000" {...register('income', { required: true, min: 0 })} />
              {errors.income && <span className="text-red-500 text-xs">Required</span>}
            </div>
            <div>
              <label>GPA</label>
              <Input type="number" step="0.01" max="4.0" min="0" {...register('gpa', { required: true, min: 0, max: 4 })} />
              {errors.gpa && <span className="text-red-500 text-xs">Required (0-4.0)</span>}
            </div>
            <div>
              <label>SAT Score (optional)</label>
              <Input type="number" step="10" min="400" max="1600" {...register('sat')} />
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="inState"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      type="checkbox"
                      id="inState"
                      checked={!!field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <label htmlFor="inState">In-State Resident</label>
                  </>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Calculate</Button>
            </DialogFooter>
          </form>
        )}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <span>Calculating...</span>
          </div>
        )}
        {data && !isPending && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">Net Price: ${data.netPrice.toLocaleString()}</div>
              <div className="text-sm text-gray-500">(Estimated cost to you)</div>
            </div>
            <CostChart stickerPrice={chartSticker} netPrice={chartNet} aid={chartAid} />
            <div className="space-y-2">
              <div className="flex justify-between"><span>Sticker Price</span><span>${data.stickerPrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Merit Aid</span><span className="text-green-700">-${data.meritAid.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Need-Based Aid</span><span className="text-green-700">-${data.needAid.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Expected Family Contribution (EFC)</span><span>${data.efc.toLocaleString()}</span></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); resetMutation(); }}>Recalculate</Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
        {error && <div className="text-red-500 text-center mt-2">{error.message}</div>}
      </DialogContent>
    </Dialog>
  );
};
