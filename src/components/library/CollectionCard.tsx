import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, Archive, FileText, User } from 'lucide-react';
import type { LibraryCollection } from '@/types/library';
import { useState } from 'react';

interface CollectionCardProps {
  collection: LibraryCollection;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  campaign: 'Campaign',
  initiative: 'Initiative',
  program: 'Program',
  custom: 'Collection',
};

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const isArchived = collection.status === 'archived';
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all group ${isArchived ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      {/* Cover image or fallback */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden rounded-t-lg">
        {collection.coverImageUrl ? (
          <>
            {!imageLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
            <img
              src={collection.coverImageUrl}
              alt={collection.name}
              className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <Folder className="w-10 h-10 text-primary/30" />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="secondary" className="text-[10px]">
            {typeLabels[collection.collectionType] || 'Collection'}
          </Badge>
          {isArchived && (
            <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
              <Archive className="w-3 h-3" />
              Archived
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {collection.itemCount || 0} item{collection.itemCount !== 1 ? 's' : ''}
          </span>
          {collection.createdByName && (
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{collection.createdByName}</span>
            </span>
          )}
        </div>
        {collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {collection.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
            {collection.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{collection.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
