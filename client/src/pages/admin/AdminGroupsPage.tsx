import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, Pencil, Trash2, Plus, Users, Calculator } from 'lucide-react';
import { toast } from 'sonner';
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

type UniversityGroup = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  _count: {
    universities: number;
  };
};

export default function AdminGroupsPage() {
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery<UniversityGroup[]>({
    queryKey: ['admin-groups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data.data as UniversityGroup[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      toast.success('Group deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete group');
    },
  });

  const columns: ColumnDef<UniversityGroup>[] = [
    {
      accessorKey: 'logoUrl',
      header: 'Logo',
      cell: ({ row }) => {
        const logoUrl = row.getValue('logoUrl') as string | null;
        return logoUrl ? (
          <img src={logoUrl} alt={row.original.name} className="h-10 w-10 object-contain rounded" />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('name') as string}</span>,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.getValue('slug') as string}</span>,
    },
    {
      accessorKey: '_count.universities',
      header: 'Members',
      cell: ({ row }) => {
        const count = row.original._count.universities;
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const desc = row.getValue('description') as string | null;
        return desc ? (
          <span className="text-sm text-gray-600 line-clamp-1 max-w-md">{desc}</span>
        ) : (
          <span className="text-gray-400">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/groups/${row.original.id}`}>
            <Button variant="ghost" size="sm" title="Edit group info">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/admin/groups/${row.original.id}/metrics`}>
            <Button variant="ghost" size="sm" title="Control metrics">
              <Calculator className="h-4 w-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete "{row.original.name}" but will not affect the member universities. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(row.original.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">University Groups</h2>
          <p className="text-gray-600 text-sm mt-1">Manage collections like "Ivy League" or "Top Public Universities"</p>
        </div>
        <Link to="/admin/groups/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Group
          </Button>
        </Link>
      </div>

      {groups && groups.length > 0 ? (
        <DataTable columns={columns} data={groups} />
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 mb-4">Create your first university group to get started.</p>
          <Link to="/admin/groups/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
