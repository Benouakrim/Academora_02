import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpDown, Pencil } from 'lucide-react'

type Article = {
  id: string
  title: string
  status: string
  publishedAt: string | null
  author?: { firstName?: string; lastName?: string }
  category?: { name?: string }
}

export default function ArticlesList() {
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, string>>({});
    const statusOptions = ["DRAFT", "PUBLISHED", "PENDING", "REJECTED", "ARCHIVED"];
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
    const [updatingPublishedId, setUpdatingPublishedId] = useState<string | null>(null);
    const [publishedMap, setPublishedMap] = useState<Record<string, string>>({});

    useEffect(() => {
      (async () => {
        try {
          const res = await api.get('/articles/taxonomies');
          setCategories(res.data.categories || []);
        } catch {}
      })();
    }, []);
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await api.get('/articles', { params: { limit: 100 } })
      return res.data.data as Article[]
    },
  })

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
        cell: ({ row }) => (
          <Link
            to={`/blog/${row.original.id}`}
            className="font-medium line-clamp-1 text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.getValue('title') as string}
          </Link>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
        cell: ({ row }) => {
          const id = row.original.id;
          const status = statusMap[id] ?? (row.getValue('status') as string);
          return (
            <Select
              value={status}
              onValueChange={async (newStatus) => {
                setUpdatingStatusId(id);
                setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
                try {
                  await api.patch(`/articles/${id}`, { status: newStatus });
                } catch (e) {
                  // Optionally show error
                }
                setUpdatingStatusId(null);
              }}
            >
              <SelectTrigger className={`w-[120px] ${updatingStatusId === id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
        cell: ({ row }) => {
          const id = row.original.id;
          // Try to get category id from row.original.category (if available)
          const currentCatId = categoryMap[id] ?? (row.original.category ? (row.original.category as any).id : '') ?? '';
          return (
            <Select
              value={currentCatId}
              onValueChange={async (newCatId) => {
                setUpdatingCategoryId(id);
                setCategoryMap((prev) => ({ ...prev, [id]: newCatId }));
                try {
                  await api.patch(`/articles/${id}`, { categoryId: newCatId });
                } catch (e) {}
                setUpdatingCategoryId(null);
              }}
            >
              <SelectTrigger className={`w-[140px] ${updatingCategoryId === id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
        cell: ({ row }) => {
          const id = row.original.id;
          const published = publishedMap[id] ?? row.original.publishedAt;
          return (
            <input
              type="date"
              value={published ? published.slice(0, 10) : ''}
              onChange={async (e) => {
                setUpdatingPublishedId(id);
                setPublishedMap((prev) => ({ ...prev, [id]: e.target.value }));
                try {
                  await api.patch(`/articles/${id}`, { publishedAt: e.target.value });
                } catch (e) {}
                setUpdatingPublishedId(null);
              }}
              disabled={updatingPublishedId === id}
              className="border rounded px-2 py-1 w-[140px]"
            />
          );
        },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link to={`/admin/articles/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Articles</h2>
        <Link to="/admin/articles/new">
          <Button>Write New</Button>
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <DataTable columns={columns} data={articles || []} />
      )}
    </div>
  )
}
