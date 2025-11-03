// useFrameComposer.ts - FIXED UPLOAD PATH
import { useState } from 'react';
import type { Frame, FrameComposerData } from '../utils/frames';
import { frameActions } from '../utils/frameActions';
import { supabase } from '../assets/lib/supabaseClient';

export const useFrameComposer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFrame = async (frameData: FrameComposerData): Promise<Frame | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a frame');
      }

      console.log('🔄 Starting image upload to frame-images bucket...');

      // UPLOAD IMAGES TO STORAGE BUCKET
      const storageImageUrls: string[] = [];
      
      for (let i = 0; i < frameData.image_urls.length; i++) {
        const dataUrl = frameData.image_urls[i];
        
        if (dataUrl.startsWith('data:image')) {
          console.log(`📤 Uploading image ${i + 1} to storage...`);
          
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          // Create unique filename - SIMPLIFIED PATH
          const fileExt = dataUrl.split(';')[0].split('/')[1] || 'png';
          const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          
          // Upload to Supabase Storage - NO USER FOLDER
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('frame-images')
            .upload(fileName, blob);

          if (uploadError) {
            console.error('❌ Image upload failed:', uploadError);
            console.error('Upload error details:', {
              message: uploadError.message,
              name: uploadError.name,
              stack: uploadError.stack
            });
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          // Get public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('frame-images')
            .getPublicUrl(uploadData.path);
            
          storageImageUrls.push(publicUrl);
          console.log(`✅ Image ${i + 1} uploaded:`, publicUrl);
        } else {
          // Already a regular URL, keep as is
          storageImageUrls.push(dataUrl);
        }
      }

      console.log('🎉 All images uploaded to storage:', storageImageUrls);

      // Send proper storage URLs to frameActions
      const frameDataWithStorageUrls: FrameComposerData = {
        ...frameData,
        image_urls: storageImageUrls
      };

      console.log('🔄 Calling frameActions with storage URLs...');
      const newFrame = await frameActions.createFrame(frameDataWithStorageUrls);
      
      if (newFrame) {
        console.log('✅ Frame created successfully with storage images');
      } else {
        console.log('❌ Frame creation failed');
      }
      
      return newFrame;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create frame';
      setError(message);
      console.error('💥 Frame creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    createFrame,
    clearError,
  };
};