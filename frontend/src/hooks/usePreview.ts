// src/hooks/usePreview.ts
import { useState, useMemo, useCallback } from 'react';

interface UsePreviewProps<T> {
  user: any | null;
  buildPreviewData: () => T;
  hasContent: boolean;
}

interface UsePreviewReturn<T> {
  showPreview: boolean;
  previewData: T;
  openPreview: () => void;
  closePreview: () => void;
  canPreview: boolean;
}

export function usePreview<T>({
  user,
  buildPreviewData,
  hasContent
}: UsePreviewProps<T>): UsePreviewReturn<T> {
  const [showPreview, setShowPreview] = useState(false);

  const previewData = useMemo(() => {
    return buildPreviewData();
  }, [buildPreviewData]);

  const openPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const closePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  const canPreview = hasContent && !!user;

  return {
    showPreview,
    previewData,
    openPreview,
    closePreview,
    canPreview
  };
}