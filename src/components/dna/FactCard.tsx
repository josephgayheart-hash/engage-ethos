import { Fact } from '@/hooks/useFactBook';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  StarOff, 
  Trash2, 
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface FactCardProps {
  fact: Fact;
  onEdit?: (fact: Fact) => void;
  onDelete?: (id: string) => void;
  onToggleHighlight?: (id: string, highlight: boolean) => void;
  isAdmin?: boolean;
  compact?: boolean;
}

export function FactCard({ 
  fact, 
  onEdit, 
  onDelete, 
  onToggleHighlight,
  isAdmin = false,
  compact = false
}: FactCardProps) {
  const formatValue = (value: string, format: Fact['display_format']) => {
    switch (format) {
      case 'currency':
        return value.startsWith('$') ? value : `$${value}`;
      case 'percentage':
        return value.endsWith('%') ? value : `${value}%`;
      case 'ranking':
        return value.startsWith('#') ? value : `#${value}`;
      default:
        return value;
    }
  };

  const getTrendIcon = () => {
    if (!fact.change_direction) return null;
    
    switch (fact.change_direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{fact.label}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-foreground">
              {formatValue(fact.value, fact.display_format)}
            </span>
            {getTrendIcon()}
            {fact.change_amount && (
              <span className={`text-xs ${
                fact.change_direction === 'up' ? 'text-green-600' : 
                fact.change_direction === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {fact.change_amount}
              </span>
            )}
          </div>
        </div>
        {fact.is_highlight && (
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card className={`relative ${fact.is_highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {fact.year && (
              <Badge variant="outline" className="text-xs">
                {fact.year}
              </Badge>
            )}
            {fact.is_highlight && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Key Stat
              </Badge>
            )}
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onToggleHighlight?.(fact.id, !fact.is_highlight)}
              >
                {fact.is_highlight ? (
                  <StarOff className="w-4 h-4 text-amber-500" />
                ) : (
                  <Star className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit?.(fact)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(fact.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">
              {formatValue(fact.value, fact.display_format)}
            </span>
            {getTrendIcon()}
          </div>
          {fact.change_amount && (
            <span className={`text-sm ${
              fact.change_direction === 'up' ? 'text-green-600' : 
              fact.change_direction === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {fact.change_amount} from {fact.previous_value || 'previous'}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="font-medium text-foreground mb-1">{fact.label}</p>

        {/* Context */}
        {fact.context && (
          <p className="text-sm text-muted-foreground mb-2">{fact.context}</p>
        )}

        {/* Source */}
        {fact.source_document && (
          <p className="text-xs text-muted-foreground">
            Source: {fact.source_document}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
