import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
// Note the extra ../ because we're in components subfolder
import type { CreateBagInput, UpdateBagInput, Bag } from '../../../server/src/schema';

interface BagFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: Bag | null;
  isEditing?: boolean;
}

const BAG_TYPES = [
  'Backpack', 'Handbag', 'Tote Bag', 'Clutch', 'Crossbody', 'Shoulder Bag', 
  'Messenger Bag', 'Duffel Bag', 'Satchel', 'Briefcase', 'Hobo Bag', 'Wallet'
];

const COLORS = [
  'Black', 'Brown', 'Tan', 'White', 'Beige', 'Navy', 'Red', 'Pink', 
  'Purple', 'Blue', 'Green', 'Yellow', 'Orange', 'Gray', 'Gold', 'Silver'
];

const MATERIALS = [
  'Leather', 'Canvas', 'Synthetic', 'Nylon', 'Suede', 'Fabric', 
  'Denim', 'Vinyl', 'Mesh', 'Faux Leather', 'Cotton', 'Polyester'
];

export function BagForm({ onSubmit, isLoading = false, initialData, isEditing = false }: BagFormProps) {
  const [formData, setFormData] = useState<CreateBagInput>({
    type: '',
    color: '',
    material: '',
    quantity: 1
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        color: initialData.color,
        material: initialData.material,
        quantity: initialData.quantity
      });
    } else {
      setFormData({
        type: '',
        color: '',
        material: '',
        quantity: 1
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = isEditing && initialData 
      ? { id: initialData.id, ...formData } as UpdateBagInput
      : formData as CreateBagInput;
    
    await onSubmit(submitData);
    
    // Reset form after successful submission (only for create, not edit)
    if (!isEditing) {
      setFormData({
        type: '',
        color: '',
        material: '',
        quantity: 1
      });
    }
  };

  const handleSelectChange = (field: keyof CreateBagInput, value: string | undefined) => {
    if (value) {
      setFormData((prev: CreateBagInput) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium text-gray-700">
          Bag Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.type || undefined}
          onValueChange={(value) => handleSelectChange('type', value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select bag type..." />
          </SelectTrigger>
          <SelectContent>
            {BAG_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color" className="text-sm font-medium text-gray-700">
          Color <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.color || undefined}
          onValueChange={(value) => handleSelectChange('color', value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select color..." />
          </SelectTrigger>
          <SelectContent>
            {COLORS.map((color) => (
              <SelectItem key={color} value={color}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ 
                      backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' :
                                     color.toLowerCase() === 'tan' ? '#D2B48C' :
                                     color.toLowerCase() === 'navy' ? '#000080' :
                                     color.toLowerCase()
                    }}
                  />
                  {color}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="material" className="text-sm font-medium text-gray-700">
          Material <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.material || undefined}
          onValueChange={(value) => handleSelectChange('material', value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select material..." />
          </SelectTrigger>
          <SelectContent>
            {MATERIALS.map((material) => (
              <SelectItem key={material} value={material}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Quantity <span className="text-red-500">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateBagInput) => ({ 
              ...prev, 
              quantity: parseInt(e.target.value) || 0 
            }))
          }
          min="0"
          max="999"
          className="w-full"
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || !formData.type || !formData.color || !formData.material}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isLoading 
          ? (isEditing ? 'Updating...' : 'Adding...') 
          : (isEditing ? '✏️ Update Bag' : '➕ Add Bag')
        }
      </Button>
    </form>
  );
}