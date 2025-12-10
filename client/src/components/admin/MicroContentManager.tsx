import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
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

type MicroContent = {
  id: string;
  category: string;
  title: string;
  content: string;
  priority: number;
};

interface MicroContentManagerProps {
  universityId: string;
}

export default function MicroContentManager({ universityId }: MicroContentManagerProps) {
  console.log('[MicroContentManager] Component rendered with universityId:', universityId);
  
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    priority: 0,
  });

  const { data: microContent = [], isLoading } = useQuery<MicroContent[]>({
    queryKey: ['micro-content', universityId],
    queryFn: async () => {
      const res = await api.get(`/micro-content/university/${universityId}`);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('[MicroContentManager] Creating micro-content:', { data, universityId });
      const payload = { ...data, universityId };
      console.log('[MicroContentManager] Payload:', payload);
      const response = await api.post('/micro-content', payload);
      console.log('[MicroContentManager] Response:', response);
      return response;
    },
    onSuccess: () => {
      console.log('[MicroContentManager] Create success');
      queryClient.invalidateQueries({ queryKey: ['micro-content', universityId] });
      toast.success('Micro-content created successfully');
      resetForm();
    },
    onError: (error: unknown) => {
      console.error('[MicroContentManager] Create error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create micro-content');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      await api.put(`/micro-content/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content', universityId] });
      toast.success('Micro-content updated successfully');
      resetForm();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update micro-content');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/micro-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content', universityId] });
      toast.success('Micro-content deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete micro-content');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; priority: number }[]) => {
      await api.patch('/micro-content/reorder', { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micro-content', universityId] });
      toast.success('Order updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update order');
    },
  });

  const resetForm = () => {
    setFormData({ category: '', title: '', content: '', priority: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (item: MicroContent) => {
    setFormData({
      category: item.category,
      title: item.title,
      content: item.content,
      priority: item.priority,
    });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('[MicroContentManager] Form submitted:', { formData, editingId, universityId });
    
    if (!formData.category || !formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      console.log('[MicroContentManager] Updating existing micro-content');
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      console.log('[MicroContentManager] Creating new micro-content');
      createMutation.mutate(formData);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === microContent.length - 1)
    ) {
      return;
    }

    const newContent = [...microContent];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap priorities
    const items = [
      { id: newContent[index].id, priority: newContent[targetIndex].priority },
      { id: newContent[targetIndex].id, priority: newContent[index].priority },
    ];

    reorderMutation.mutate(items);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick Tips & Micro-Content</h3>
          <p className="text-sm text-gray-600">
            Bite-sized content like application tips, deadlines, or fun facts
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Tip
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit Micro-Content' : 'Add New Micro-Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., application_tips, deadlines"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Essay Deadline"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Brief content..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e as any)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {microContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No micro-content added yet. Click "Add Tip" to create your first one.
            </CardContent>
          </Card>
        ) : (
          microContent.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0 || reorderMutation.isPending}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === microContent.length - 1 || reorderMutation.isPending}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                        <p className="text-sm text-gray-700">{item.content}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Micro-Content?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{item.title}". This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
