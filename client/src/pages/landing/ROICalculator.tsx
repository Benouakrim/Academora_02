import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export default function ROICalculator() {
  const [tuitionCost, setTuitionCost] = useState(50000)
  const [academoraEstimate, setAcademoraEstimate] = useState(35000)
  const [scholarships, setScholarships] = useState(10000)

  // Calculate potential savings
  const estimatedSavings = tuitionCost - academoraEstimate + scholarships
  const savingsPercentage = Math.round((estimatedSavings / tuitionCost) * 100)

  const handleTuitionChange = (value: number[]) => {
    const newTuition = value[0]
    setTuitionCost(newTuition)
    setAcademoraEstimate(Math.round(newTuition * 0.7))
  }

  const handleScholarshipsChange = (value: number[]) => {
    setScholarships(value[0])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-md"
    >
      <Card className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="text-2xl font-bold mb-2 text-center">
          Estimate Your Savings
        </h3>
        <p className="text-center text-sm text-muted-foreground mb-8">
          See how much you could save with Academora's financial aid predictions
        </p>

        {/* Tuition Input */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Annual Tuition Cost</label>
              <span className="text-lg font-bold text-primary">
                ${tuitionCost.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[tuitionCost]}
              onValueChange={handleTuitionChange}
              min={20000}
              max={100000}
              step={5000}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Range: $20,000 - $100,000
            </p>
          </div>

          {/* Scholarships Input */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Additional Scholarships Found</label>
              <span className="text-lg font-bold text-green-500">
                +${scholarships.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[scholarships]}
              onValueChange={handleScholarshipsChange}
              min={0}
              max={50000}
              step={5000}
              className="w-full"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 pt-6"></div>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Sticker Price</span>
              <span className="font-semibold">${tuitionCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Actual Net Cost</span>
              <span className="font-semibold text-accent">${academoraEstimate.toLocaleString()}</span>
            </div>

            {/* Total Savings */}
            <motion.div
              layout
              className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Potential Annual Savings</p>
                <motion.div
                  key={estimatedSavings}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-green-600 mb-2"
                >
                  ${estimatedSavings.toLocaleString()}
                </motion.div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-green-600">
                    {savingsPercentage}% off
                  </span>
                  <span className="text-xs text-muted-foreground">
                    over 4 years
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Over Time Projection */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[1, 2, 4].map((years) => (
                <div
                  key={years}
                  className="p-2 bg-background/50 rounded-lg"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {years === 1 ? '1 Year' : years === 2 ? '2 Years' : '4 Years'}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    ${(estimatedSavings * years).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button className="w-full mt-6">
            See Your Actual Savings
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This is an estimate based on average scenarios
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
