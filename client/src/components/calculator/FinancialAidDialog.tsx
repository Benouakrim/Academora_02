import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CostChart } from './CostChart';
import { useFinancialAid } from '../../hooks/useFinancialAid';
import { useUserStore } from '../../store/useUserStore';

interface FinancialAidDialogProps {
  universityId: string;
  isOpen: boolean;
  onClose: () => void;
  stickerPrice?: number; // optional, maintained for backward compatibility
}

type FormValues = {
  familyIncome: number;
  gpa: number;
  satScore?: number;
  residency: 'in-state' | 'out-of-state' | 'international';
  savings?: number;
  investments?: number;
  familySize?: number;
};

export const FinancialAidDialog: React.FC<FinancialAidDialogProps> = ({ universityId, isOpen, onClose }) => {
  const user = useUserStore((s) => s.profile);
  const { register, handleSubmit, control, watch } = useForm<FormValues>({
    defaultValues: {
      familyIncome: user?.financialProfile?.householdIncome || undefined,
      gpa: user?.gpa || undefined,
      satScore: user?.satScore || undefined,
      residency: 'out-of-state',
      savings: user?.financialProfile?.savings || undefined,
      investments: user?.financialProfile?.investments || undefined,
      familySize: user?.financialProfile?.familySize || undefined,
    },
  });

  const { mutate, data, isPending, reset: resetMutation } = useFinancialAid();

  const onSubmit = (values: FormValues) => {
    mutate({
      universityId,
      familyIncome: Number(values.familyIncome),
      gpa: Number(values.gpa),
      satScore: values.satScore ? Number(values.satScore) : undefined,
      residency: values.residency,
      savings: values.savings ? Number(values.savings) : undefined,
      investments: values.investments ? Number(values.investments) : undefined,
      familySize: values.familySize ? Number(values.familySize) : undefined,
    });
  };

  const handleClose = () => {
    resetMutation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Financial Aid Estimator</DialogTitle>
        
        {!data && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Household Income ($)</label>
                <Input type="number" {...register('familyIncome', { required: true, min: 0 })} placeholder="80000" />
              </div>
              <div>
                <label className="text-sm font-medium">GPA</label>
                <Input type="number" step="0.01" {...register('gpa', { required: true, max: 4 })} placeholder="3.8" />
              </div>
              <div>
                <label className="text-sm font-medium">SAT Score (Optional)</label>
                <Input type="number" {...register('satScore')} placeholder="1350" />
              </div>
              <div>
                <label className="text-sm font-medium">Residency Status</label>
                <Controller
                  name="residency"
                  control={control}
                  render={({ field }) => (
                    <select 
                      {...field} 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="in-state">In-State</option>
                      <option value="out-of-state">Out-of-State</option>
                      <option value="international">International</option>
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Savings (Optional)</label>
                <Input type="number" {...register('savings')} placeholder="25000" />
              </div>
              <div>
                <label className="text-sm font-medium">Investments (Optional)</label>
                <Input type="number" {...register('investments')} placeholder="50000" />
              </div>
              <div>
                <label className="text-sm font-medium">Family Size (Optional)</label>
                <Input type="number" {...register('familySize')} placeholder="4" />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Calculating...' : 'Calculate Net Price'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {data && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-sm text-muted-foreground uppercase">Estimated Net Price</span>
              <div className="text-4xl font-bold text-primary mt-1">${Math.round(data.netPrice).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">{data.breakdown}</p>
            </div>

            <CostChart stickerPrice={data.grossCost} netPrice={data.netPrice} aid={data.totalAid} />

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm border-t pt-4">
              <div className="flex justify-between"><span>Tuition</span><span>${data.tuition.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Housing</span><span>${data.housing.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t"><span>Gross Cost</span><span>${data.grossCost.toLocaleString()}</span></div>
              
              <div className="col-span-2 my-2" />

              <div className="flex justify-between text-green-600"><span>Grants (Need)</span><span>-${Math.round(data.needAid).toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Scholarships (Merit)</span><span>-${Math.round(data.meritAid).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t"><span>Total Aid</span><span className="text-green-600">-${Math.round(data.totalAid).toLocaleString()}</span></div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetMutation}>Recalculate</Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
