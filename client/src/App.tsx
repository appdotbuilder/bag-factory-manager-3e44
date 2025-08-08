import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { BagForm } from '@/components/BagForm';
import { BagCard } from '@/components/BagCard';
// Using type-only import for better TypeScript compliance
import type { Bag, CreateBagInput, UpdateBagInput } from '../../server/src/schema';

function App() {
  // Explicit typing with Bag interface
  const [bags, setBags] = useState<Bag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [deletingBag, setDeletingBag] = useState<Bag | null>(null);

  // useCallback to memoize function used in useEffect
  const loadBags = useCallback(async () => {
    try {
      const result = await trpc.getBags.query();
      setBags(result);
    } catch (error) {
      console.error('Failed to load bags:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadBags();
  }, [loadBags]);

  const handleCreateBag = async (formData: CreateBagInput) => {
    setIsLoading(true);
    try {
      const newBag = await trpc.createBag.mutate(formData);
      // Update bags list with explicit typing in setState callback
      setBags((prev: Bag[]) => [...prev, newBag]);
    } catch (error) {
      console.error('Failed to create bag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBag = async (formData: UpdateBagInput) => {
    if (!editingBag) return;
    
    setIsLoading(true);
    try {
      const updatedBag = await trpc.updateBag.mutate(formData);
      if (updatedBag) {
        setBags((prev: Bag[]) => 
          prev.map((bag: Bag) => bag.id === updatedBag.id ? updatedBag : bag)
        );
        setEditingBag(null);
      }
    } catch (error) {
      console.error('Failed to update bag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBag = async () => {
    if (!deletingBag) return;

    setIsLoading(true);
    try {
      await trpc.deleteBag.mutate({ id: deletingBag.id });
      setBags((prev: Bag[]) => prev.filter((bag: Bag) => bag.id !== deletingBag.id));
      setDeletingBag(null);
    } catch (error) {
      console.error('Failed to delete bag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBags = bags.reduce((sum, bag) => sum + bag.quantity, 0);
  const uniqueTypes = new Set(bags.map(bag => bag.type)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            👜 Bag Collection Manager
          </h1>
          <p className="text-gray-600">Organize and track your beautiful bag collection</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bags</p>
                  <p className="text-2xl font-bold text-purple-600">{totalBags}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👜</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Types</p>
                  <p className="text-2xl font-bold text-pink-600">{uniqueTypes}</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collection Items</p>
                  <p className="text-2xl font-bold text-blue-600">{bags.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{editingBag ? '✏️' : '➕'}</span>
                  {editingBag ? 'Edit Bag' : 'Add New Bag'}
                </CardTitle>
                {editingBag && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBag(null)}
                    className="w-fit"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <BagForm
                  onSubmit={editingBag ? 
                    (data: any) => handleUpdateBag(data as UpdateBagInput) : 
                    (data: any) => handleCreateBag(data as CreateBagInput)
                  }
                  isLoading={isLoading}
                  initialData={editingBag}
                  isEditing={!!editingBag}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bags List */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Collection</h2>
              <Separator className="bg-gradient-to-r from-purple-300 to-pink-300" />
            </div>

            {bags.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-dashed border-2 border-gray-300">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No bags yet!</h3>
                  <p className="text-gray-500">Start building your collection by adding your first bag.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bags.map((bag: Bag) => (
                  <BagCard
                    key={bag.id}
                    bag={bag}
                    onEdit={() => setEditingBag(bag)}
                    onDelete={() => setDeletingBag(bag)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingBag} onOpenChange={() => setDeletingBag(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bag</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {deletingBag?.type} bag? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBag}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default App;