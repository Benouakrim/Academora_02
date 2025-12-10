import { ExternalLink, MapPin, Building2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UniversityGroupDetail } from '@shared/types';

interface GroupHeaderProps {
  group: UniversityGroupDetail;
}

export default function GroupHeader({ group }: GroupHeaderProps) {
  const location = [group.city, group.region].filter(Boolean).join(', ');

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 opacity-95" />
      
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo */}
          <div className="flex-shrink-0">
            {group.logoUrl ? (
              <img
                src={group.logoUrl}
                alt={group.name}
                className="h-32 w-32 object-contain rounded-2xl bg-white/95 p-4 shadow-xl"
              />
            ) : (
              <div className="h-32 w-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Building2 className="h-16 w-16 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-white">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {group.groupType && (
                <Badge variant="outline" className="border-white/40 text-white bg-black/20 backdrop-blur-sm">
                  {group.groupType}
                </Badge>
              )}
              {group.memberCount > 0 && (
                <Badge variant="outline" className="border-white/40 text-white bg-black/20 backdrop-blur-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {group.memberCount} {group.memberCount === 1 ? 'Institution' : 'Institutions'}
                </Badge>
              )}
              {group.yearFounded && (
                <Badge variant="outline" className="border-white/40 text-white bg-black/20 backdrop-blur-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  Est. {group.yearFounded}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-shadow-sm">
              {group.name}
            </h1>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2 text-white/90 text-lg mb-4">
                <MapPin className="h-5 w-5" />
                {location}
              </div>
            )}

            {/* Description */}
            {group.description && (
              <p className="text-lg text-white/90 max-w-3xl leading-relaxed mb-6">
                {group.description}
              </p>
            )}

            {/* Website Button */}
            {group.website && (
              <a href={group.website} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="shadow-lg">
                  Visit Website <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Key Stats Bar */}
        {(group.totalStudentPopulation || group.totalStaffCount || group.numberOfCampuses) && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {group.totalStudentPopulation && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-white/70 text-sm font-medium mb-1">Total Students</div>
                <div className="text-3xl font-bold text-white">
                  {group.totalStudentPopulation.toLocaleString()}
                </div>
              </div>
            )}
            {group.totalStaffCount && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-white/70 text-sm font-medium mb-1">Staff & Faculty</div>
                <div className="text-3xl font-bold text-white">
                  {group.totalStaffCount.toLocaleString()}
                </div>
              </div>
            )}
            {group.numberOfCampuses && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-white/70 text-sm font-medium mb-1">Campuses</div>
                <div className="text-3xl font-bold text-white">
                  {group.numberOfCampuses}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
