import { useParams } from 'react-router-dom'
import { usePublicProfile } from '@/hooks/usePublicProfile'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { GraduationCap, Award, BookOpen, Star, Users, Lock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const cleanUsername = username?.startsWith('@') ? username.slice(1) : username
  const { data: profile, isLoading, error } = usePublicProfile(cleanUsername)

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h1 className="text-xl font-semibold">Profile Not Found</h1>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We couldn't find the profile you're looking for. The user may have deleted their profile or the username might be incorrect.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (profile.isPrivate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">This Profile is Private</h1>
            <p className="text-muted-foreground">
              The user has chosen to keep their profile private. Only they can view it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="pb-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-16 sm:-mt-20 relative z-10 mb-4">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                  <AvatarImage src={profile.avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col justify-end">
                  <h1 className="text-2xl sm:text-3xl font-bold">{displayName || 'Academora User'}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <Separator className="my-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={Award} label="Reviews" value={profile.stats?.reviewsCount || 0} />
                <StatCard icon={BookOpen} label="Articles" value={profile.stats?.articlesCount || 0} />
                {profile.stats?.savedUniversitiesCount !== undefined && (
                  <StatCard icon={Users} label="Saved" value={profile.stats.savedUniversitiesCount} />
                )}
                {profile.badges && profile.badges.length > 0 && (
                  <StatCard icon={Star} label="Badges" value={profile.badges.length} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges Section */}
            {profile.badges && profile.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.badges.map((badge) => (
                      <div key={badge.id} className="group">
                        <div className="relative p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer h-full flex flex-col items-center text-center">
                          {badge.iconUrl && (
                            <img src={badge.iconUrl} alt={badge.name} className="w-12 h-12 mb-2" />
                          )}
                          <p className="text-xs font-medium line-clamp-2">{badge.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Academic Information */}
            {profile.academicInfo && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Profile
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {profile.academicInfo.gpa && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">GPA</p>
                        <p className="text-lg font-semibold">{profile.academicInfo.gpa.toFixed(2)}</p>
                      </div>
                    )}
                    {profile.academicInfo.preferredMajor && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">Major</p>
                        <p className="text-sm font-semibold">{profile.academicInfo.preferredMajor}</p>
                      </div>
                    )}
                  </div>

                  {profile.academicInfo.testScores && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Test Scores</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {profile.academicInfo.testScores.sat && (
                            <div className="p-2 bg-secondary rounded text-center">
                              <p className="text-xs text-muted-foreground">SAT</p>
                              <p className="font-medium">{profile.academicInfo.testScores.sat}</p>
                            </div>
                          )}
                          {profile.academicInfo.testScores.act && (
                            <div className="p-2 bg-secondary rounded text-center">
                              <p className="text-xs text-muted-foreground">ACT</p>
                              <p className="font-medium">{profile.academicInfo.testScores.act}</p>
                            </div>
                          )}
                          {profile.academicInfo.testScores.gre && (
                            <div className="p-2 bg-secondary rounded text-center">
                              <p className="text-xs text-muted-foreground">GRE</p>
                              <p className="font-medium">{profile.academicInfo.testScores.gre}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Reviews */}
            {profile.recentReviews && profile.recentReviews.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Recent Reviews
                  </h2>
                  {(profile.stats?.reviewsCount || 0) > 5 && (
                    <Link to={`/@${profile.username}/reviews`} className="text-xs text-primary hover:underline">
                      View all
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg hover:bg-secondary/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          to={`/universities/${review.universitySlug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {review.universityName}
                        </Link>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-1">{review.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Articles */}
            {profile.recentArticles && profile.recentArticles.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recent Articles
                  </h2>
                  {(profile.stats?.articlesCount || 0) > 5 && (
                    <Link to={`/@${profile.username}/articles`} className="text-xs text-primary hover:underline">
                      View all
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.recentArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="block p-3 border rounded-lg hover:bg-secondary/5 hover:border-primary/30 transition-colors"
                    >
                      <p className="font-medium hover:text-primary">{article.title}</p>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Interests */}
            {(profile.hobbies?.length || profile.languagesSpoken?.length || profile.careerGoals?.length) && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">About</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.dreamJobTitle && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Dream Job</p>
                      <p className="text-sm">{profile.dreamJobTitle}</p>
                    </div>
                  )}

                  {profile.careerGoals && profile.careerGoals.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Career Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.careerGoals.map((goal, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Hobbies</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.hobbies.map((hobby, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.languagesSpoken && profile.languagesSpoken.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">Languages</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.languagesSpoken.map((lang, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Card */}
            {profile.email && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Contact</h2>
                </CardHeader>
                <CardContent>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {profile.email}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Card className="overflow-hidden">
          <Skeleton className="h-32 sm:h-48 w-full" />
          <CardContent className="pb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-16 sm:-mt-20 relative z-10 mb-4">
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
