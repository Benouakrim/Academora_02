// client/src/components/admin/MicroContentManagerV2.tsx
// New improved version with block type support
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { BlockType, MicroContentBlock } from '@/../../shared/types/microContentBlocks';
import { BLOCK_METADATA as blockMetadata } from '@/../../shared/types/microContentBlocks';
import BlockEditor from './BlockEditor';
import BlockRenderer from '../blocks/BlockRenderer';

interface MicroContentManagerV2Props {
  universityId: string;
}

type SavedBlock = {
  id: string;
  blockType: string;
  title: string;
  data: Record<string, unknown>;
  priority: number;
};

export default function MicroContentManagerV2({ universityId }: MicroContentManagerV2Props) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('rich_text_block');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    data: {},
  });

  const { data: blocks = [], isLoading } = useQuery<SavedBlock[]>({
    queryKey: ['micro-content-v2', universityId],
    queryFn: async () => {
      const res = await api.get(`/micro-content/university/${universityId}`);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { blockType: BlockType; title: string; data: Record<string, unknown> }) => {
      const response = await api.post('/micro-content', {
        ...payload,
        universityId,
        priority: 0,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content-v2', universityId] });
      toast.success('Block created successfully');
      resetForm();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create block');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      await api.put(`/micro-content/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content-v2', universityId] });
      toast.success('Block updated successfully');
      resetForm();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update block');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/micro-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content-v2', universityId] });
      toast.success('Block deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete block');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; priority: number }[]) => {
      await api.patch('/micro-content/reorder', { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content-v2', universityId] });
      toast.success('Order updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update order');
    },
  });

  const resetForm = () => {
    setFormData({ title: '', data: {} });
    setIsAdding(false);
    setEditingId(null);
    setSelectedBlockType('rich_text_block');
  };

  const handleEdit = (block: SavedBlock) => {
    setFormData({
      title: block.title,
      data: block.data,
    });
    setSelectedBlockType(block.blockType as BlockType);
    setEditingId(block.id);
    setIsAdding(false);
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Please provide a title');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        payload: {
          blockType: selectedBlockType,
          title: formData.title,
          data: formData.data,
        },
      });
    } else {
      createMutation.mutate({
        blockType: selectedBlockType,
        title: formData.title,
        data: formData.data,
      });
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const items = [
      { id: newBlocks[index].id, priority: newBlocks[targetIndex].priority },
      { id: newBlocks[targetIndex].id, priority: newBlocks[index].priority },
    ];

    reorderMutation.mutate(items);
  };

  // Group blocks by category
  const blocksByCategory = Object.entries(blockMetadata).reduce((acc, [, meta]) => {
    if (!acc[meta.category]) acc[meta.category] = [];
    acc[meta.category].push(meta);
    return acc;
  }, {} as Record<string, typeof blockMetadata[BlockType][]>);

  // Filter blocks
  const filteredBlocks = selectedCategory === 'all'
    ? blocks
    : blocks.filter((b) => {
        const meta = blockMetadata[b.blockType as BlockType];
        return meta && meta.category === selectedCategory;
      });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Micro-Content Blocks
          </h3>
          <p className="text-sm text-gray-600">
            Create engaging, bite-sized content blocks for students
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit Block' : 'Create New Block'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Block Type Selection */}
              {!editingId && (
                <div>
                  <Label className="mb-3 block">Select Block Type *</Label>
                  <Tabs value={selectedBlockType} onValueChange={(v) => setSelectedBlockType(v as BlockType)}>
                    <TabsList className="grid w-full grid-cols-5 h-auto">
                      <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                      <TabsTrigger value="interactive" className="text-xs">Interactive</TabsTrigger>
                      <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
                      <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
                      <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
                    </TabsList>
                    {Object.entries(blocksByCategory).map(([category, blocks]) => (
                      <TabsContent key={category} value={category} className="mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {blocks.map((blockMeta) => (
                            <button
                              key={blockMeta.type}
                              type="button"
                              onClick={() => setSelectedBlockType(blockMeta.type)}
                              className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                                selectedBlockType === blockMeta.type
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="font-medium text-sm">{blockMeta.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{blockMeta.description}</div>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}

              {/* Title */}
              <div>
                <Label>Block Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Application Tips, Important Deadline..."
                />
              </div>

              {/* Block-specific fields */}
              <div>
                <Label className="mb-3 block">Block Configuration</Label>
                <BlockEditor
                  blockType={selectedBlockType}
                  data={formData.data}
                  onChange={(newData) => setFormData((prev) => ({ ...prev, data: newData }))}
                />
              </div>

              {/* Preview */}
              <div>
                <Label className="mb-3 block">Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <BlockRenderer
                    block={{
                      type: selectedBlockType,
                      title: formData.title || 'Preview',
                      data: formData.data,
                    } as MicroContentBlock}
                    isPreview={true}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'} Block
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      {blocks.length > 0 && (
        <div className="flex items-center gap-2">
          <Label className="text-sm">Filter:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-3">
        {filteredBlocks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              {selectedCategory === 'all'
                ? 'No blocks added yet. Click "Add Block" to create your first one.'
                : `No ${selectedCategory} blocks found.`}
            </CardContent>
          </Card>
        ) : (
          filteredBlocks.map((block, index) => {
            const meta = blockMetadata[block.blockType as BlockType];
            return (
              <Card key={block.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0 || reorderMutation.isPending}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === blocks.length - 1 || reorderMutation.isPending}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Block content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{block.title}</h4>
                          {meta && (
                            <Badge variant="secondary" className="mt-1">
                              {meta.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(block)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Block</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(block.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-3 border-t pt-3">
                        <BlockRenderer
                          block={{
                            ...block,
                            type: block.blockType,
                          } as unknown as MicroContentBlock}
                          isPreview={true}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
