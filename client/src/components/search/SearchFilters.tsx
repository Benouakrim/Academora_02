import { Search, MapPin, DollarSign, BookOpen, Sun, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { SearchFilters } from '@/hooks/useUniversitySearch'

type Props = {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
}

export default function SearchFilters({ filters, onChange }: Props) {
  const update = (key: keyof SearchFilters, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name..." 
          value={filters.search || ''} 
          onChange={(e) => update('search', e.target.value)}
          className="pl-9 bg-white dark:bg-neutral-900"
        />
      </div>

      <Accordion type="multiple" defaultValue={['location', 'academics', 'costs']} className="w-full">
        {/* Location Section */}
        <AccordionItem value="location">
          <AccordionTrigger className="text-sm font-semibold">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Country</Label>
              <Select value={filters.country || 'all'} onValueChange={(v) => update('country', v === 'all' ? undefined : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Country</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex gap-2 items-center"><Sun className="h-3 w-3" /> Climate</Label>
              <Select value={filters.climate || 'all'} onValueChange={(v) => update('climate', v === 'all' ? undefined : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any Climate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Climate</SelectItem>
                  <SelectItem value="Temperate">Temperate</SelectItem>
                  <SelectItem value="Tropical">Tropical</SelectItem>
                  <SelectItem value="Cold">Cold / Continental</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                </SelectContent>
              </Select>
            </div>
             
            <div className="space-y-2">
              <Label className="text-xs flex gap-2 items-center"><Building className="h-3 w-3" /> Setting</Label>
              <Select value={filters.setting || 'all'} onValueChange={(v) => update('setting', v === 'all' ? undefined : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any Setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Setting</SelectItem>
                  <SelectItem value="URBAN">Urban City</SelectItem>
                  <SelectItem value="SUBURBAN">Suburban</SelectItem>
                  <SelectItem value="RURAL">Rural / College Town</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Costs Section */}
        <AccordionItem value="costs">
          <AccordionTrigger className="text-sm font-semibold">
            <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600" /> Financials</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4 px-1">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Max Tuition</span>
                <span className="font-medium text-primary">${((filters.maxTuition || 60000) / 1000).toFixed(0)}k</span>
              </div>
              <Slider
                min={5000}
                max={80000}
                step={1000}
                value={[filters.maxTuition || 60000]}
                onValueChange={(v) => update('maxTuition', v[0])}
                className="[&>.bg-primary]:bg-green-600"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Academics Section */}
        <AccordionItem value="academics">
          <AccordionTrigger className="text-sm font-semibold">
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-600" /> Academics</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Specific Major</Label>
              <Input 
                placeholder="e.g. Computer Science" 
                className="h-9"
                value={filters.major || ''}
                onChange={(e) => update('major', e.target.value)}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs">
                <span>Min GPA Required</span>
                <span className="font-medium text-primary">{filters.minGpa || 'Any'}</span>
              </div>
              <Slider
                min={2.0}
                max={4.0}
                step={0.1}
                value={[filters.minGpa || 2.0]}
                onValueChange={(v) => update('minGpa', v[0])}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        variant="outline" 
        className="w-full text-xs"
        onClick={() => onChange({})}
      >
        Reset Filters
      </Button>
    </div>
  )
}
