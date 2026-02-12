import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLibraryCollections } from '@/hooks/useLibraryCollections';
import { useSharedLibrary } from '@/hooks/useSharedLibrary';
import { AssetCard } from '@/components/library/AssetCard';
import { AssetLinkForm } from '@/components/library/AssetLinkForm';
import type { CollectionItem, ExternalAsset } from '@/types/library';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Folder, Plus, Archive, FileText, Image, Pencil, Trash2, Check, X } from 'lucide-react';

const typeLabels: Record<string, string> = {
  campaign: 'Campaign',
  initiative: 'Initiative',
  program: 'Program',
  custom: 'Collection',
};

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collections, getCollectionItems, addItemToCollection, removeItemFromCollection, updateCollection, deleteCollection } = useLibraryCollections();
  const { getTemplateById } = useSharedLibrary();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Inline editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const collection = collections.find(c => c.id === id);

  const loadItems = useCallback(async () => {
    if (!id) return;
    setIsLoadingItems(true);
    const data = await getCollectionItems(id);
    setItems(data);
    setIsLoadingItems(false);
  }, [id, getCollectionItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddAsset = async (asset: ExternalAsset) => {
    if (!id) return;
    const success = await addItemToCollection(id, {
      itemType: 'external_asset',
      externalAsset: asset,
    });
    if (success) {
      toast({ title: 'Asset linked', description: `${asset.label} added to collection.` });
      await loadItems();
      setShowAssetForm(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const success = await removeItemFromCollection(itemId);
    if (success) {
      toast({ title: 'Item removed from collection' });
      await loadItems();
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    await updateCollection(id, { status: collection?.status === 'archived' ? 'active' : 'archived' });
    toast({ title: collection?.status === 'archived' ? 'Collection reactivated' : 'Collection archived' });
  };

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteCollection(id);
    if (success) {
      toast({ title: 'Collection deleted' });
      navigate('/shared-library?tab=collections');
    } else {
      toast({ title: 'Failed to delete collection', variant: 'destructive' });
    }
  };

  const handleSaveName = async () => {
    if (!id || !editName.trim()) return;
    const success = await updateCollection(id, { name: editName.trim() });
    if (success) {
      toast({ title: 'Name updated' });
      setIsEditingName(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!id) return;
    const success = await updateCollection(id, { description: editDescription.trim() || undefined });
    if (success) {
      toast({ title: 'Description updated' });
      setIsEditingDescription(false);
    }
  };

  const startEditName = () => {
    setEditName(collection?.name || '');
    setIsEditingName(true);
  };

  const startEditDescription = () => {
    setEditDescription(collection?.description || '');
    setIsEditingDescription(true);
  };

  const templateItems = items.filter(i => i.itemType === 'template');
  const messageItems = items.filter(i => i.itemType === 'message');
  const assetItems = items.filter(i => i.itemType === 'external_asset');

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-2">Collection Not Found</h1>
            <p className="text-muted-foreground mb-6">This collection may have been removed.</p>
            <Link to="/shared-library">
              <Button>Back to Library</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/shared-library">Library</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{collection.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                {collection.coverImageUrl ? (
                  <img src={collection.coverImageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Folder className="w-8 h-8 text-primary/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* Editable name */}
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="font-serif text-xl font-bold h-9"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveName}>
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="font-serif text-2xl font-bold truncate">{collection.name}</h1>
                    <Badge variant="secondary">{typeLabels[collection.collectionType]}</Badge>
                    {collection.status === 'archived' && <Badge variant="outline">Archived</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={startEditName}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Editable description */}
                {isEditingDescription ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={2}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsEditingDescription(false);
                      }}
                    />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleSaveDescription}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditingDescription(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group/desc mt-1 flex items-start gap-1">
                    {collection.description ? (
                      <p className="text-muted-foreground text-sm">{collection.description}</p>
                    ) : (
                      <p className="text-muted-foreground/50 text-sm italic">No description</p>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover/desc:opacity-100 transition-opacity flex-shrink-0"
                      onClick={startEditDescription}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                  {collection.createdByName && (
                    <>
                      <span>·</span>
                      <span>by {collection.createdByName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-1" />
                {collection.status === 'archived' ? 'Reactivate' : 'Archive'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{collection.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this collection and unlink all items. The items themselves won't be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Collection
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="content">Messages & Playbooks ({templateItems.length + messageItems.length})</TabsTrigger>
              <TabsTrigger value="assets">Assets & Creative ({assetItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {items.length === 0 && !isLoadingItems ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">No items yet</h3>
                    <p className="text-muted-foreground mb-4">Add playbooks, messages, or external asset links to this collection.</p>
                    <Button onClick={() => setShowAssetForm(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Link External Asset
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {renderContentItems(templateItems, messageItems, getTemplateById, navigate, handleRemoveItem)}
                  {assetItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {assetItems.map(item => (
                        item.externalAsset && (
                          <AssetCard
                            key={item.id}
                            asset={item.externalAsset}
                            onRemove={() => handleRemoveItem(item.id)}
                          />
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              {templateItems.length + messageItems.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No messages or playbooks in this collection yet.</p>
                  </CardContent>
                </Card>
              ) : (
                renderContentItems(templateItems, messageItems, getTemplateById, navigate, handleRemoveItem)
              )}
            </TabsContent>

            <TabsContent value="assets" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowAssetForm(!showAssetForm)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Link Asset
                  </Button>
                </div>
                {showAssetForm && (
                  <AssetLinkForm onAdd={handleAddAsset} onCancel={() => setShowAssetForm(false)} />
                )}
                {assetItems.length === 0 && !showAssetForm ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Image className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No assets linked yet. Add Canva designs, graphics, or other creative files.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {assetItems.map(item => (
                      item.externalAsset && (
                        <AssetCard
                          key={item.id}
                          asset={item.externalAsset}
                          onRemove={() => handleRemoveItem(item.id)}
                        />
                      )
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

function renderContentItems(
  templateItems: CollectionItem[],
  messageItems: CollectionItem[],
  getTemplateById: (id: string) => any,
  navigate: (path: string) => void,
  onRemove: (id: string) => void
) {
  const allContent = [...templateItems, ...messageItems];
  if (allContent.length === 0) return null;

  return (
    <div className="space-y-2">
      {allContent.map(item => {
        const template = item.templateId ? getTemplateById(item.templateId) : null;
        const title = template?.title || (item.messageId ? 'Personal Message' : 'Unknown item');

        return (
          <Card key={item.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => {
                  if (item.templateId) navigate(`/shared-library/${item.templateId}`);
                  else if (item.messageId) navigate(`/library/${item.messageId}`);
                }}
              >
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.itemType}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onRemove(item.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default CollectionDetailPage;
