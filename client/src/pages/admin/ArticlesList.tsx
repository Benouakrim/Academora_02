import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      cell: ({ row }) => <span className="font-medium line-clamp-1">{row.getValue('title') as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>{status}</Badge>
      },
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name ?? '—',
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as string | null
        return date ? format(new Date(date), 'MMM d, yyyy') : '—'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Link to={`/admin/articles/edit/${row.original.id}`}>
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
        <Link to="/blog/write">
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
