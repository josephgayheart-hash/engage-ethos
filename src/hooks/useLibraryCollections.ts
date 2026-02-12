import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LibraryCollection, CollectionItem, CollectionType, CollectionStatus, ExternalAsset } from '@/types/library';

export function useLibraryCollections() {
  const [collections, setCollections] = useState<LibraryCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();

  const loadCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('library_collections')
        .select('*, library_collection_items(id)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch collections:', error);
        setIsLoading(false);
        return;
      }

      const mapped: LibraryCollection[] = (data || []).map((row: any) => ({
        id: row.id,
        tenantId: row.tenant_id,
        createdBy: row.created_by,
        createdByName: row.created_by_name || undefined,
        name: row.name,
        description: row.description || undefined,
        collectionType: row.collection_type as CollectionType,
        coverImageUrl: row.cover_image_url || undefined,
        tags: row.tags || [],
        status: row.status as CollectionStatus,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        itemCount: row.library_collection_items?.length || 0,
      }));

      setCollections(mapped);
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const createCollection = useCallback(async (input: {
    name: string;
    description?: string;
    collectionType: CollectionType;
    coverImageUrl?: string;
    tags?: string[];
  }) => {
    if (!profile) return null;

    const creatorName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined;

    const { data, error } = await supabase
      .from('library_collections')
      .insert({
        tenant_id: profile.tenant_id,
        created_by: profile.id,
        created_by_name: creatorName,
        name: input.name,
        description: input.description || null,
        collection_type: input.collectionType,
        cover_image_url: input.coverImageUrl || null,
        tags: input.tags || [],
        status: 'active',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Failed to create collection:', error);
      return null;
    }

    await loadCollections();

    // Trigger AI cover image generation in the background
    if (data?.id) {
      supabase.functions.invoke('generate-collection-cover', {
        body: {
          collectionId: data.id,
          collectionName: input.name,
          collectionType: input.collectionType,
          description: input.description,
        },
      }).then(() => {
        // Refresh to pick up the new cover image
        loadCollections();
      }).catch((err) => {
        console.warn('Cover image generation failed:', err);
      });
    }

    return data;
  }, [profile, loadCollections]);

  const updateCollection = useCallback(async (id: string, updates: Partial<Pick<LibraryCollection, 'name' | 'description' | 'collectionType' | 'coverImageUrl' | 'tags' | 'status'>>) => {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.collectionType !== undefined) payload.collection_type = updates.collectionType;
    if (updates.coverImageUrl !== undefined) payload.cover_image_url = updates.coverImageUrl;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.status !== undefined) payload.status = updates.status;

    const { error } = await supabase
      .from('library_collections')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update collection:', error);
      return false;
    }

    await loadCollections();
    return true;
  }, [loadCollections]);

  const deleteCollection = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('library_collections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete collection:', error);
      return false;
    }

    await loadCollections();
    return true;
  }, [loadCollections]);

  const getCollectionItems = useCallback(async (collectionId: string): Promise<CollectionItem[]> => {
    const { data, error } = await supabase
      .from('library_collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch collection items:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      collectionId: row.collection_id,
      tenantId: row.tenant_id,
      itemType: row.item_type,
      templateId: row.template_id || undefined,
      messageId: row.message_id || undefined,
      externalAsset: row.external_asset || undefined,
      sortOrder: row.sort_order || 0,
      addedBy: row.added_by || undefined,
      addedAt: row.added_at,
    }));
  }, []);

  const addItemToCollection = useCallback(async (collectionId: string, item: {
    itemType: 'template' | 'message' | 'external_asset';
    templateId?: string;
    messageId?: string;
    externalAsset?: ExternalAsset;
  }) => {
    if (!profile) return false;

    const { error } = await supabase
      .from('library_collection_items')
      .insert({
        collection_id: collectionId,
        tenant_id: profile.tenant_id,
        item_type: item.itemType,
        template_id: item.templateId || null,
        message_id: item.messageId || null,
        external_asset: item.externalAsset ? (item.externalAsset as any) : null,
        added_by: profile.id,
        sort_order: 0,
      } as any);

    if (error) {
      console.error('Failed to add item to collection:', error);
      return false;
    }

    await loadCollections();
    return true;
  }, [profile, loadCollections]);

  const removeItemFromCollection = useCallback(async (itemId: string) => {
    const { error } = await supabase
      .from('library_collection_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Failed to remove item from collection:', error);
      return false;
    }

    await loadCollections();
    return true;
  }, [loadCollections]);

  return {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollectionItems,
    addItemToCollection,
    removeItemFromCollection,
    refreshCollections: loadCollections,
  };
}
