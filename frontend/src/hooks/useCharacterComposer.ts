'use client';

import { useState } from 'react';
import { characterActions } from '../utils/characterActions';
import type { Character, CharacterVisualReference } from '../utils/character-types';

// Import supabase from your project's configuration
import { supabase } from '../assets/lib/supabaseClient'; // Adjust path to match your project

interface UseCharacterComposerProps {
  initialSceneId?: string | null;
}

export function useCharacterComposer({ initialSceneId = null }: UseCharacterComposerProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - default to draft for safe option
  const [characterData, setCharacterData] = useState({
    name: '',
    tagline: '',
    bio: '',
    scene_id: initialSceneId,
    status: 'draft' as const, // ✅ CHANGED TO 'draft' as default for smart button system
  });

  const [visualReferences, setVisualReferences] = useState<CharacterVisualReference[]>([]);

  // Update form fields
  const updateField = (field: keyof typeof characterData, value: string) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ADDED: Upload image to Supabase Storage and return public URL
  const uploadImageToStorage = async (imageData: string): Promise<string> => {
    try {
      // Check if it's a blob URL (from file upload) or base64
      if (imageData.startsWith('blob:')) {
        // Convert blob URL to file
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Create unique filename
        const fileExt = 'png'; // Default extension
        const fileName = `character-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('character-images')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('character-images')
          .getPublicUrl(uploadData.path);
          
        return publicUrl;
      } else if (imageData.startsWith('data:image')) {
        // Handle base64 data URL
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Create unique filename
        const fileExt = imageData.split(';')[0].split('/')[1] || 'png';
        const fileName = `character-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('character-images')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('character-images')
          .getPublicUrl(uploadData.path);
          
        return publicUrl;
      } else {
        // Already a regular URL, return as is
        return imageData;
      }
    } catch (err) {
      console.error('Error uploading image to storage:', err);
      throw err;
    }
  };

  // UPDATED: Add visual reference with storage upload
  const addVisualReference = async (imageUrl: string) => {
    try {
      // Upload image to storage and get public URL
      const storageUrl = await uploadImageToStorage(imageUrl);
      
      const newReference = {
        character_id: '', // Will be set when character is created
        image_url: storageUrl, // ✅ NOW STORES STORAGE URL, NOT BLOB/BASE64
      };
      
      // For now, store locally until character is created
      setVisualReferences(prev => [...prev, { 
        ...newReference, 
        id: Math.random().toString(), 
        created_at: new Date().toISOString() 
      } as CharacterVisualReference]);
    } catch (err) {
      console.error('Failed to add visual reference:', err);
      setError('Failed to upload image. Please try again.');
    }
  };

  // Remove visual reference
  const removeVisualReference = (id: string) => {
    setVisualReferences(prev => prev.filter(ref => ref.id !== id));
  };

  // Submit character with status parameter for smart button system
  const submitCharacter = async (status: 'draft' | 'published' = 'draft'): Promise<Character | null> => {
    console.log('🔍 useCharacterComposer: Starting character submission');
    console.log('🔍 useCharacterComposer: Character data:', characterData);
    console.log('🔍 useCharacterComposer: Submission status:', status);
    
    setIsLoading(true);
    setError(null);

    try {
      // Basic validation matching your mockup requirements
      if (!characterData.name.trim()) {
        throw new Error('Character name is required');
      }

      if (!characterData.tagline.trim()) {
        throw new Error('Tagline or trait is required');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a character');
      }

      console.log('🔍 useCharacterComposer: Creating character with status:', status);
      
      // Create character with the specified status
      const newCharacter = await characterActions.createCharacter({
        ...characterData,
        user_id: user.id,
        status: status, // ✅ Use the passed status parameter from smart button
      });

      console.log('✅ useCharacterComposer: Character created successfully:', newCharacter);

      // Add visual references if any
      if (visualReferences.length > 0) {
        console.log('🔍 useCharacterComposer: Adding visual references:', visualReferences.length);
        for (const ref of visualReferences) {
          await characterActions.addVisualReference({
            character_id: newCharacter.id,
            image_url: ref.image_url // ✅ NOW STORES STORAGE URL
          });
        }
        console.log('✅ useCharacterComposer: Visual references added successfully');
      }

      return newCharacter;

    } catch (err) {
      console.log('❌ useCharacterComposer: Error creating character:', err);
      const message = err instanceof Error ? err.message : 'Failed to create character';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCharacterData({
      name: '',
      tagline: '',
      bio: '',
      scene_id: initialSceneId,
      status: 'draft', // ✅ CHANGED TO 'draft' for consistent smart button behavior
    });
    setVisualReferences([]);
    setError(null);
  };

  return {
    // State
    characterData,
    visualReferences,
    isLoading,
    error,
    
    // Actions
    updateField,
    addVisualReference,
    removeVisualReference,
    submitCharacter, // ✅ Now accepts status parameter for smart button system
    resetForm,
  };
}