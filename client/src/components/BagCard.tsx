import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Note the extra ../ because we're in components subfolder
import type { Bag } from '../../../server/src/schema';

interface BagCardProps {
  bag: Bag;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper function to get emoji for bag type
const getBagTypeEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    'Backpack': '🎒',
    'Handbag': '👜',
    'Tote Bag': '🛍️',
    'Clutch': '👝',
    'Crossbody': '👜',
    'Shoulder Bag': '👜',
    'Messenger Bag': '💼',
    'Duffel Bag': '🧳',
    'Satchel': '💼',
    'Briefcase': '💼',
    'Hobo Bag': '👜',
    'Wallet': '👛'
  };
  return emojiMap[type] || '👜';
};

// Helper function to get color dot
const getColorStyle = (color: string) => {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'Brown': '#8B4513',
    'Tan': '#D2B48C',
    'White': '#FFFFFF',
    'Beige': '#F5F5DC',
    'Navy': '#000080',
    'Red': '#FF0000',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Orange': '#FFA500',
    'Gray': '#808080',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0'
  };
  
  return {
    backgroundColor: colorMap[color] || color.toLowerCase(),
    border: color === 'White' || color === 'Yellow' || color === 'Beige' ? '1px solid #ccc' : 'none'
  };
};

export function BagCard({ bag, onEdit, onDelete }: BagCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getBagTypeEmoji(bag.type)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{bag.type}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={getColorStyle(bag.color)}
                />
                <span className="text-sm text-gray-600">{bag.color}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 border-purple-200"
            >
              Qty: {bag.quantity}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Material:</span>
            <Badge variant="outline" className="text-xs">
              {bag.material}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-500">
            Added: {bag.created_at.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              ✏️ Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}