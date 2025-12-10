// client/src/components/admin/BlockEditor.tsx
// Form component for editing different block types
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import type { BlockType } from '@/../../shared/types/microContentBlocks';

interface BlockEditorProps {
  blockType: BlockType;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function BlockEditor({ blockType, data, onChange }: BlockEditorProps) {
  // Helper to safely get string values
  const getString = (key: string, defaultValue = ''): string => {
    const value = data[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  const getBoolean = (key: string, defaultValue = false): boolean => {
    const value = data[key];
    return typeof value === 'boolean' ? value : defaultValue;
  };

  const updateField = (field: string, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const updateNestedField = (field: string, index: number, subField: string, value: unknown) => {
    const array = [...((data[field] as unknown[]) || [])];
    array[index] = { ...(array[index] as Record<string, unknown>), [subField]: value };
    updateField(field, array);
  };

  const addArrayItem = (field: string, template: Record<string, unknown>) => {
    const array = [...((data[field] as unknown[]) || [])];
    array.push({ ...template, id: crypto.randomUUID() });
    updateField(field, array);
  };

  const removeArrayItem = (field: string, index: number) => {
    const array = [...((data[field] as unknown[]) || [])];
    array.splice(index, 1);
    updateField(field, array);
  };

  switch (blockType) {
    case 'deadline_card':
      return (
        <div className="space-y-4">
          <div>
            <Label>Label *</Label>
            <Input
              value={getString('label')}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g., Application Deadline"
            />
          </div>
          <div>
            <Label>Deadline Date *</Label>
            <Input
              type="datetime-local"
              value={getString('deadline')}
              onChange={(e) => updateField('deadline', e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Additional context..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('showCountdown')}
              onCheckedChange={(checked) => updateField('showCountdown', checked)}
            />
            <Label>Show countdown timer</Label>
          </div>
        </div>
      );

    case 'announcement_banner':
      return (
        <div className="space-y-4">
          <div>
            <Label>Message *</Label>
            <Textarea
              value={getString('message')}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="Your announcement message..."
            />
          </div>
          <div>
            <Label>Severity</Label>
            <Select value={getString('severity', 'info')} onValueChange={(v) => updateField('severity', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('dismissible', true)}
              onCheckedChange={(checked) => updateField('dismissible', checked)}
            />
            <Label>Allow users to dismiss</Label>
          </div>
          <div>
            <Label>Expires At (Optional)</Label>
            <Input
              type="datetime-local"
              value={getString('expiresAt')}
              onChange={(e) => updateField('expiresAt', e.target.value)}
            />
          </div>
        </div>
      );

    case 'checklist':
      return (
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('allowUserCompletion', true)}
              onCheckedChange={(checked) => updateField('allowUserCompletion', checked)}
            />
            <Label>Allow users to check off items</Label>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Checklist Items *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addArrayItem('items', { text: '', completed: false })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {((data.items as Array<{id?: string; text: string}>) || []).map((item, idx: number) => (
                <div key={item.id || idx} className="flex gap-2">
                  <Input
                    value={item.text}
                    onChange={(e) => updateNestedField('items', idx, 'text', e.target.value)}
                    placeholder="Item text..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeArrayItem('items', idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'key_stat_card':
      return (
        <div className="space-y-4">
          <div>
            <Label>Value *</Label>
            <Input
              value={getString('value')}
              onChange={(e) => updateField('value', e.target.value)}
              placeholder="e.g., 98"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Input
              value={getString('unit')}
              onChange={(e) => updateField('unit', e.target.value)}
              placeholder="e.g., %, $, etc."
            />
          </div>
          <div>
            <Label>Label *</Label>
            <Input
              value={getString('label')}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g., Job Placement Rate"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
        </div>
      );

    case 'rich_text_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Content *</Label>
            <Textarea
              value={getString('content')}
              onChange={(e) => updateField('content', e.target.value)}
              rows={8}
              placeholder="Enter your content (HTML or plain text)..."
            />
          </div>
          <div>
            <Label>Format</Label>
            <Select value={getString('format', 'html')} onValueChange={(v) => updateField('format', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'call_to_action':
      return (
        <div className="space-y-4">
          <div>
            <Label>Button Text *</Label>
            <Input
              value={getString('buttonText')}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="e.g., Apply Now"
            />
          </div>
          <div>
            <Label>URL *</Label>
            <Input
              value={getString('url')}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div>
            <Label>Button Style</Label>
            <Select value={getString('style', 'primary')} onValueChange={(v) => updateField('style', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('openInNewTab', true)}
              onCheckedChange={(checked) => updateField('openInNewTab', checked)}
            />
            <Label>Open in new tab</Label>
          </div>
        </div>
      );

    case 'timeline_roadmap_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Timeline description"
            />
          </div>
          <div>
            <Label>Steps</Label>
            {Array.isArray(data.steps) && (
              <div className="space-y-3 mt-2">
                {(data.steps as Record<string, unknown>[]).map((step, idx) => (
                  <div key={(step.id as string) || idx} className="border p-3 rounded-lg space-y-2">
                    <Input
                      value={getString(`steps[${idx}].title`)}
                      placeholder="Step title"
                      onChange={(e) => updateNestedField('steps', idx, 'title', e.target.value)}
                    />
                    <Textarea
                      value={getString(`steps[${idx}].description`)}
                      placeholder="Step description"
                      onChange={(e) => updateNestedField('steps', idx, 'description', e.target.value)}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeArrayItem('steps', idx)}>
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => addArrayItem('steps', { title: '', description: '', completed: false })} className="mt-2">
              <Plus className="h-4 w-4" /> Add Step
            </Button>
          </div>
        </div>
      );

    case 'testimonial_quote_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Quote *</Label>
            <Textarea
              value={getString('quote')}
              onChange={(e) => updateField('quote', e.target.value)}
              placeholder="Quote text"
            />
          </div>
          <div>
            <Label>Author *</Label>
            <Input
              value={getString('author')}
              onChange={(e) => updateField('author', e.target.value)}
              placeholder="Author name"
            />
          </div>
          <div>
            <Label>Author Title</Label>
            <Input
              value={getString('authorTitle')}
              onChange={(e) => updateField('authorTitle', e.target.value)}
              placeholder="e.g., Student, Class of 2024"
            />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input
              value={getString('avatarUrl')}
              onChange={(e) => updateField('avatarUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Rating (1-5)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={data.rating || 5}
              onChange={(e) => updateField('rating', parseInt(e.target.value))}
            />
          </div>
        </div>
      );

    case 'image_showcase_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Image URL *</Label>
            <Input
              value={getString('imageUrl')}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={getString('altText')}
              onChange={(e) => updateField('altText', e.target.value)}
              placeholder="Image description"
            />
          </div>
          <div>
            <Label>Caption</Label>
            <Textarea
              value={getString('caption')}
              onChange={(e) => updateField('caption', e.target.value)}
            />
          </div>
          <div>
            <Label>Aspect Ratio</Label>
            <Select value={getString('aspectRatio', 'auto')} onValueChange={(v) => updateField('aspectRatio', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Video)</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('clickable')}
              onCheckedChange={(checked) => updateField('clickable', checked)}
            />
            <Label>Make image clickable</Label>
          </div>
          {getBoolean('clickable') && (
            <div>
              <Label>Link URL</Label>
              <Input
                value={getString('linkUrl')}
                onChange={(e) => updateField('linkUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      );

    case 'video_embed_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Select value={getString('provider', 'youtube')} onValueChange={(v) => updateField('provider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="vimeo">Vimeo</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Video URL *</Label>
            <Input
              value={getString('videoUrl')}
              onChange={(e) => updateField('videoUrl', e.target.value)}
              placeholder="Video URL or ID"
            />
          </div>
          <div>
            <Label>Video ID (for YouTube/Vimeo)</Label>
            <Input
              value={getString('videoId')}
              onChange={(e) => updateField('videoId', e.target.value)}
              placeholder="Video ID"
            />
          </div>
          <div>
            <Label>Caption</Label>
            <Textarea value={getString('caption')} onChange={(e) => updateField('caption', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('autoplay')}
              onCheckedChange={(checked) => updateField('autoplay', checked)}
            />
            <Label>Autoplay</Label>
          </div>
        </div>
      );

    case 'faq_accordion_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Question *</Label>
            <Textarea
              value={getString('question')}
              onChange={(e) => updateField('question', e.target.value)}
              placeholder="FAQ question"
            />
          </div>
          <div>
            <Label>Answer *</Label>
            <Textarea
              value={getString('answer')}
              onChange={(e) => updateField('answer', e.target.value)}
              placeholder="FAQ answer"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('defaultOpen')}
              onCheckedChange={(checked) => updateField('defaultOpen', checked)}
            />
            <Label>Open by default</Label>
          </div>
        </div>
      );

    case 'comparison_metric_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Metric Name</Label>
            <Input
              value={getString('metric')}
              onChange={(e) => updateField('metric', e.target.value)}
              placeholder="e.g., Student Satisfaction"
            />
          </div>
          <div>
            <Label>Our Value *</Label>
            <Input
              value={getString('ourValue')}
              onChange={(e) => updateField('ourValue', e.target.value)}
              placeholder="Value"
            />
          </div>
          <div>
            <Label>Comparison Value *</Label>
            <Input
              value={getString('comparisonValue')}
              onChange={(e) => updateField('comparisonValue', e.target.value)}
              placeholder="Value to compare against"
            />
          </div>
          <div>
            <Label>Comparison Label</Label>
            <Input
              value={getString('comparisonLabel')}
              onChange={(e) => updateField('comparisonLabel', e.target.value)}
              placeholder="e.g., National Average"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Input
              value={getString('unit')}
              onChange={(e) => updateField('unit', e.target.value)}
              placeholder="e.g., %"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('isBetter')}
              onCheckedChange={(checked) => updateField('isBetter', checked)}
            />
            <Label>Our value is better</Label>
          </div>
        </div>
      );

    case 'contact_box_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Department *</Label>
            <Input
              value={getString('department')}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="Department name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={getString('email')}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contact@university.edu"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={getString('phone')}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={getString('location')}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Building name, room number"
            />
          </div>
          <div>
            <Label>Office Hours</Label>
            <Input
              value={getString('officeHours')}
              onChange={(e) => updateField('officeHours', e.target.value)}
              placeholder="Mon-Fri, 9am-5pm"
            />
          </div>
          <div>
            <Label>Additional Info</Label>
            <Textarea
              value={getString('additionalInfo')}
              onChange={(e) => updateField('additionalInfo', e.target.value)}
            />
          </div>
        </div>
      );

    case 'link_list_resources_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Resource list description"
            />
          </div>
          <div>
            <Label>Links</Label>
            {Array.isArray(data.links) && (
              <div className="space-y-3 mt-2">
                {(data.links as Record<string, unknown>[]).map((link, idx) => (
                  <div key={(link.id as string) || idx} className="border p-3 rounded-lg space-y-2">
                    <Input
                      value={getString(`links[${idx}].title`)}
                      placeholder="Link title"
                      onChange={(e) => updateNestedField('links', idx, 'title', e.target.value)}
                    />
                    <Input
                      value={getString(`links[${idx}].url`)}
                      placeholder="https://..."
                      onChange={(e) => updateNestedField('links', idx, 'url', e.target.value)}
                    />
                    <Textarea
                      value={getString(`links[${idx}].description`)}
                      placeholder="Link description"
                      onChange={(e) => updateNestedField('links', idx, 'description', e.target.value)}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeArrayItem('links', idx)}>
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => addArrayItem('links', { title: '', url: '', description: '' })} className="mt-2">
              <Plus className="h-4 w-4" /> Add Link
            </Button>
          </div>
        </div>
      );

    case 'quick_poll_survey_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Question *</Label>
            <Textarea
              value={getString('question')}
              onChange={(e) => updateField('question', e.target.value)}
              placeholder="Poll question"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('allowMultiple')}
              onCheckedChange={(checked) => updateField('allowMultiple', checked)}
            />
            <Label>Allow multiple selections</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('showResults')}
              onCheckedChange={(checked) => updateField('showResults', checked)}
            />
            <Label>Show results</Label>
          </div>
          <div>
            <Label>Options</Label>
            {Array.isArray(data.options) && (
              <div className="space-y-2 mt-2">
                {(data.options as Record<string, unknown>[]).map((opt, idx) => (
                  <div key={(opt.id as string) || idx} className="flex gap-2">
                    <Input
                      value={getString(`options[${idx}].text`)}
                      placeholder="Option text"
                      onChange={(e) => updateNestedField('options', idx, 'text', e.target.value)}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeArrayItem('options', idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => addArrayItem('options', { text: '', votes: 0 })} className="mt-2">
              <Plus className="h-4 w-4" /> Add Option
            </Button>
          </div>
        </div>
      );

    case 'cost_breakdown_chart_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Currency</Label>
            <Input
              value={getString('currency', '$')}
              onChange={(e) => updateField('currency', e.target.value)}
              placeholder="$"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div>
            <Label>Cost Items</Label>
            {Array.isArray(data.items) && (
              <div className="space-y-3 mt-2">
                {(data.items as Record<string, unknown>[]).map((item, idx) => (
                  <div key={(item.id as string) || idx} className="border p-3 rounded-lg space-y-2">
                    <Input
                      value={getString(`items[${idx}].label`)}
                      placeholder="Item label"
                      onChange={(e) => updateNestedField('items', idx, 'label', e.target.value)}
                    />
                    <Input
                      type="number"
                      value={item.amount || 0}
                      placeholder="Amount"
                      onChange={(e) => updateNestedField('items', idx, 'amount', parseFloat(e.target.value))}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeArrayItem('items', idx)}>
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => addArrayItem('items', { label: '', amount: 0 })} className="mt-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>
      );

    case 'admissions_range_meter_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Metric Type</Label>
            <Select value={getString('metric', 'gpa')} onValueChange={(v) => updateField('metric', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpa">GPA</SelectItem>
                <SelectItem value="sat">SAT</SelectItem>
                <SelectItem value="act">ACT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Minimum Value</Label>
            <Input
              type="number"
              value={data.min || 0}
              onChange={(e) => updateField('min', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>25th Percentile</Label>
            <Input
              type="number"
              value={data.percentile25 || 0}
              onChange={(e) => updateField('percentile25', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>75th Percentile</Label>
            <Input
              type="number"
              value={data.percentile75 || 0}
              onChange={(e) => updateField('percentile75', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Maximum Value</Label>
            <Input
              type="number"
              value={data.max || 0}
              onChange={(e) => updateField('max', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>User Value (optional)</Label>
            <Input
              type="number"
              value={data.userValue || ''}
              onChange={(e) => updateField('userValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>
      );

    case 'campus_map_poi_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Location Name *</Label>
            <Input
              value={getString('name')}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Location name"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div>
            <Label>Latitude</Label>
            <Input
              type="number"
              step="0.0001"
              value={data.latitude || 0}
              onChange={(e) => updateField('latitude', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input
              type="number"
              step="0.0001"
              value={data.longitude || 0}
              onChange={(e) => updateField('longitude', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Zoom Level</Label>
            <Input
              type="number"
              min="1"
              max="21"
              value={data.zoom || 16}
              onChange={(e) => updateField('zoom', parseInt(e.target.value))}
            />
          </div>
        </div>
      );

    case 'badge_requirement_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Badge Name *</Label>
            <Input
              value={getString('badgeName')}
              onChange={(e) => updateField('badgeName', e.target.value)}
              placeholder="Badge name"
            />
          </div>
          <div>
            <Label>Badge Slug *</Label>
            <Input
              value={getString('badgeSlug')}
              onChange={(e) => updateField('badgeSlug', e.target.value)}
              placeholder="badge-slug"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div>
            <Label>Requirements</Label>
            <Textarea
              value={getString('requirements')}
              onChange={(e) => updateField('requirements', e.target.value)}
              placeholder="What users need to do to earn this badge"
            />
          </div>
          <div>
            <Label>Earned By Count</Label>
            <Input
              type="number"
              value={data.earnedByCount || 0}
              onChange={(e) => updateField('earnedByCount', parseInt(e.target.value))}
            />
          </div>
        </div>
      );

    case 'scholarship_spotlight_block':
      return (
        <div className="space-y-4">
          <div>
            <Label>Scholarship Name *</Label>
            <Input
              value={getString('scholarshipName')}
              onChange={(e) => updateField('scholarshipName', e.target.value)}
              placeholder="Scholarship name"
            />
          </div>
          <div>
            <Label>Award Amount *</Label>
            <Input
              value={getString('amount')}
              onChange={(e) => updateField('amount', e.target.value)}
              placeholder="$10,000"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={getString('description')}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div>
            <Label>Eligibility</Label>
            <Textarea
              value={getString('eligibility')}
              onChange={(e) => updateField('eligibility', e.target.value)}
            />
          </div>
          <div>
            <Label>Application Deadline</Label>
            <Input
              type="date"
              value={getString('deadline')}
              onChange={(e) => updateField('deadline', e.target.value)}
            />
          </div>
          <div>
            <Label>Application URL</Label>
            <Input
              value={getString('applicationUrl')}
              onChange={(e) => updateField('applicationUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={getBoolean('isRenewable')}
              onCheckedChange={(checked) => updateField('isRenewable', checked)}
            />
            <Label>Renewable</Label>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed rounded-lg bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Editor for {blockType} coming soon
          </p>
        </div>
      );
  }
}
