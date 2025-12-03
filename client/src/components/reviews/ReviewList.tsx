import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/clerk-react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, MessageSquarePlus, ThumbsUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import ReviewSummary from './ReviewSummary'
import { useToggleHelpful } from '@/hooks/useReviewEngagement'

type ReviewUser = { id: string; firstName?: string | null; lastName?: string | null; avatarUrl?: string | null; clerkId?: string }
type Review = {
  id: string
  user: ReviewUser
  createdAt: string
  rating: number
  title: string
  content: string
  academicRating?: number | null
  campusRating?: number | null
  socialRating?: number | null
  careerRating?: number | null
  helpfulCount: number
  verified: boolean
}

type ReviewStats = {
  count: number
  avgRating: number
  breakdown: {
    academic: number
    campus: number
    social: number
    career: number
  }
}

type ReviewResponse = {
  data: Review[]
  stats: ReviewStats
}

export default function ReviewList({ universityId }: { universityId: string }) {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Engagement hook for helpful votes
  const toggleHelpful = useToggleHelpful(universityId)

  const { data, isLoading } = useQuery<ReviewResponse>({
    queryKey: ['reviews', universityId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${universityId}`)
      return data
    }
  })

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reviews/${id}`)
    },
    onSuccess: () => {
      toast.success('Review deleted')
      queryClient.invalidateQueries({ queryKey: ['reviews', universityId] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete review')
    }
  })

  const reviews = data?.data || []
  const stats = data?.stats

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">Student Reviews</h3>
        {isSignedIn ? (
          <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-brand shadow-lg border-0">
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Write a Review
          </Button>
        ) : (
          <Button variant="outline" disabled className="opacity-70">
            Sign in to Review
          </Button>
        )}
      </div>

      {stats && stats.count > 0 && <ReviewSummary stats={stats} />}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {reviews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your experience!</p>
              </motion.div>
            ) : (
              reviews.map((review, index) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl p-6 hover:border-primary/30 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={review.user?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {review.user?.firstName?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          {review.verified && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              ✓ Verified Student
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StarRating value={review.rating} readOnly size="sm" />
                      {(user?.id === review.user?.clerkId || user?.publicMetadata?.role === 'admin') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                             if (confirm('Are you sure?')) deleteReview.mutate(review.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-bold text-lg">{review.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>
                  </div>

                  {/* Mini Breakdown Tags */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
                    {[
                      { l: 'Academic', v: review.academicRating },
                      { l: 'Social', v: review.socialRating },
                      { l: 'Campus', v: review.campusRating },
                      { l: 'Career', v: review.careerRating },
                    ].filter(x => x.v).map(tag => (
                      <div key={tag.l} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full border border-secondary/20">
                        <StarRating value={tag.v!} readOnly size="sm" />
                        {tag.l}: {tag.v}
                      </div>
                    ))}
                  </div>

                  {/* Engagement Footer */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                      onClick={() => {
                        if (!isSignedIn) {
                          toast.error('Please sign in to vote');
                          return;
                        }
                        toggleHelpful.mutate(review.id);
                      }}
                      disabled={toggleHelpful.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        Helpful ({review.helpfulCount || 0})
                      </span>
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      {review.helpfulCount > 0 && (
                        <span>{review.helpfulCount} {review.helpfulCount === 1 ? 'person found' : 'people found'} this helpful</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      <ReviewForm 
        universityId={universityId} 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  )
}
