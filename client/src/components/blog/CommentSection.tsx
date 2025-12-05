import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Reply, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

type CommentAuthor = {
  id: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

type Comment = {
  id: string
  content: string
  createdAt: string
  upvotes: number
  downvotes: number
  author: CommentAuthor
  replies?: Comment[]
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { isSignedIn } = useAuth()
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const res = await api.get<Comment[]>(`/comments/${articleId}`)
      return res.data
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      await api.post('/comments', {
        articleId,
        content: payload.content,
        parentId: payload.parentId
      })
    },
    onSuccess: () => {
      toast.success('Comment posted')
      setNewComment('')
      setReplyTo(null)
      setReplyContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] })
    },
    onError: () => toast.error('Failed to post comment')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    mutate({ content: newComment })
  }

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return
    mutate({ content: replyContent, parentId })
  }

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    toast.info('Voting feature coming soon!')
  }

  const toggleReplies = (commentId: string) => {
    const newSet = new Set(expandedReplies)
    if (newSet.has(commentId)) {
      newSet.delete(commentId)
    } else {
      newSet.add(commentId)
    }
    setExpandedReplies(newSet)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-6 border-b border-border/40">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Discussion</h3>
        {comments && (
          <span className="ml-auto text-sm text-muted-foreground px-3 py-1 bg-muted/40 rounded-full">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>

      {/* New Comment Box */}
      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea 
              placeholder="Share your thoughts... (minimum 2 characters)" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none rounded-lg border border-border/40 focus:border-primary transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {newComment.length} characters
              </span>
              <Button 
                type="submit" 
                disabled={isPending || !newComment.trim()} 
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <MessageSquare className="h-12 w-12 text-primary/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4 font-medium">Join the conversation</p>
          <p className="text-sm text-muted-foreground mb-5">Sign in to share your thoughts and engage with other learners.</p>
          <Link to="/sign-in">
            <Button variant="outline">Sign In to Comment</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-16 bg-muted rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {comments?.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No comments yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        )}
        
        {comments?.map((comment) => {
          if (!comment.author) return null;
          return (
          <div key={comment.id} className="group space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 border border-border/40 flex-shrink-0">
                <AvatarImage src={comment.author.avatarUrl || undefined} />
                <AvatarFallback>{comment.author.firstName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-muted/30 border border-border/40 rounded-lg p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
                </div>
                
                {/* Engagement Row */}
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                    onClick={() => handleVote(comment.id, 'up')}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{comment.upvotes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                    onClick={() => handleVote(comment.id, 'down')}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>{comment.downvotes}</span>
                  </Button>
                  
                  {isSignedIn && (
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="text-xs text-muted-foreground hover:text-primary font-medium h-8 px-3 rounded hover:bg-muted/40 transition-colors flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" /> Reply
                    </button>
                  )}
                </div>

                {/* Reply Input */}
                {replyTo === comment.id && (
                  <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                    <Textarea 
                      placeholder="Write a reply..." 
                      className="min-h-[70px] resize-none rounded-lg border border-border/40 focus:border-primary transition-colors"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyTo(null)
                          setReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={isPending || !replyContent.trim()}
                        className="gap-2"
                      >
                        <Send className="h-3 w-3" />
                        {isPending ? 'Posting...' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {expandedReplies.has(comment.id) ? '−' : '+'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                    
                    {expandedReplies.has(comment.id) && (
                      <div className="pl-4 border-l-2 border-border/40 space-y-4 mt-4">
                        {comment.replies.map((reply) => {
                          if (!reply.author) return null;
                          return (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 border border-border/40 flex-shrink-0">
                              <AvatarImage src={reply.author.avatarUrl || undefined} />
                              <AvatarFallback className="text-xs">{reply.author.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-muted/20 border border-border/40 rounded-lg p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="font-semibold text-xs text-foreground">
                                    {reply.author.firstName} {reply.author.lastName}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-foreground">{reply.content}</p>
                              </div>
                              
                              {/* Reply Engagement */}
                              <div className="flex items-center gap-1 mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                                  onClick={() => handleVote(reply.id, 'up')}
                                >
                                  <ThumbsUp className="h-2.5 w-2.5" />
                                  {reply.upvotes}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                                  onClick={() => handleVote(reply.id, 'down')}
                                >
                                  <ThumbsDown className="h-2.5 w-2.5" />
                                  {reply.downvotes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  )
}
