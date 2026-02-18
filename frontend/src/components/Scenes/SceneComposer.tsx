import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useSceneComposer } from '../../hooks/useSceneComposer';
import type { CreateSceneData } from '../../../types/database.types';
import { supabase } from '../../assets/lib/supabaseClient';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { promptsData } from '../../data/promptsData';
import InspirationBottomSheet from '../InspirationBottomSheet/InspirationBottomSheet';
import emailPrompts from '../../data/emailPrompts.json'; // ADDED

// ADDED: URL Input Component
const UrlImageInput: React.FC<{ onAddImage: (url: string) => void }> = ({ onAddImage }) => {
  const [url, setUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddImage(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste image URL..."
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.12)',
          background: '#FAF8F2',
          outline: 'none',
          fontSize: '14px',
          fontFamily: "'Cormorant', serif"
        }}
        onPaste={(e) => {
          // Auto-submit on paste if it looks like an image URL
          const pastedUrl = e.clipboardData.getData('text');
          if (pastedUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
            setTimeout(() => onAddImage(pastedUrl), 100);
          }
        }}
      />
      <button
        type="submit"
        disabled={!url.trim()}
        style={{
          padding: '12px 16px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: "'Cormorant', serif",
          fontSize: '14px',
          opacity: url.trim() ? 1 : 0.5
        }}
      >
        Add
      </button>
    </form>
  );
};

export const SceneComposer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sceneId = searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnPath = location.state?.from || '/home-feed';
  
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loadingScene, setLoadingScene] = useState<boolean>(false);
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published'>('draft');
  
  // ADDED: Image preview states
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [showImageInput, setShowImageInput] = useState<boolean>(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  
  // ADDED: Missing state declarations
  const [showPublishOption, setShowPublishOption] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const [isInspirationOpen, setIsInspirationOpen] = useState<boolean>(false);
  
  const { createScene, loading, error } = useSceneComposer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prompt = searchParams.get('prompt');

  // EFFECT 1: Handle email campaign prompts (short codes like ?prompt=waiting)
  useEffect(() => {
    if (prompt && emailPrompts[prompt as keyof typeof emailPrompts]) {
      const promptData = emailPrompts[prompt as keyof typeof emailPrompts];
      
      // Set title from email campaign
      if (promptData.title) {
        setTitle(promptData.title);
      }
      
      // Set image from email campaign
      if (promptData.image) {
        setImagePreviewUrl(promptData.image);
      }
      
      localStorage.setItem('user_has_created', 'true');
    }
  }, [prompt]);

  // EFFECT 2: Handle CatalystCard and direct text prompts (existing functionality)
  useEffect(() => {
    if (prompt && !emailPrompts[prompt as keyof typeof emailPrompts]) {
      // Only run if it's NOT an email campaign prompt
      setContent(decodeURIComponent(prompt));
      localStorage.setItem('user_has_created', 'true');
    }
  }, [prompt]);

  const handlePromptSelect = (prompt: any) => {
    if (prompt.title) {
      setTitle(prompt.title);
    }
    if (prompt.description) {
      setContent(prompt.description);
    }
    setIsInspirationOpen(false);
  };

  // Smart button logic - show publish option when content is substantial (CREATE MODE ONLY)
  useEffect(() => {
    if (!isEditing) {
      const hasSubstantialContent = 
        title.length > 2 && 
        content.length > 10;
      
      setShowPublishOption(hasSubstantialContent);
    }
  }, [title, content, isEditing]);

  // Load existing scene for editing
  useEffect(() => {
    const loadScene = async () => {
      if (!sceneId) return;
      
      try {
        setLoadingScene(true);
        const { data: scene, error } = await supabase
          .from('scenes')
          .select('*')
          .eq('id', sceneId)
          .single();

        if (error) throw error;
        if (scene) {
          setTitle(scene.title);
          setContent(scene.content_text || '');
          setIsEditing(true);
          setOriginalStatus(scene.status as 'draft' | 'published');
          setShowPublishOption(false);
          
          // Load scene image for preview if it exists
          if (scene.image_path) {
            const imageUrl = `https://ycrvsbtqmjksdbyrefek.supabase.co/storage/v1/object/public/scene-images/${scene.image_path}`;
            setImagePreviewUrl(imageUrl);
          }
          
          // Load scene moods
          const { data: moods } = await supabase
            .from('scene_moods')
            .select('mood')
            .eq('scene_id', sceneId);
          
          if (moods) {
            setSelectedMoods(moods.map(m => m.mood));
          }
        }
      } catch (err) {
        console.error('Error loading scene:', err);
        alert('Failed to load scene. Please try again.');
      } finally {
        setLoadingScene(false);
      }
    };

    loadScene();
  }, [sceneId]);

  const handleBack = () => {
    const hasContent = title !== '' || content !== '' || selectedImage !== null || imagePreviewUrl !== '';
    
    if (hasContent) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your changes will not be saved.');
      if (!confirmLeave) return;
    }
    
    if (isEditing && sceneId) {
      navigate(`/home-feed#scene-${sceneId}`);
    } else {
      navigate(returnPath);
    }
  };

  const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  // UPDATED: Enhanced image upload with preview
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setShowImageInput(false);
    }
  };

  // ADDED: Handle URL image input
  const handleUrlImageAdd = (url: string) => {
    if (url.trim()) {
      setImagePreviewUrl(url);
      setSelectedImage(null); // Clear file since we're using URL
      setShowImageInput(false);
    }
  };

  // ADDED: Remove image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ADDED: Handle paste for images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedImage(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreviewUrl(objectUrl);
            setShowImageInput(false);
            e.preventDefault();
            break;
          }
        }
      }
    }
  };

  // UPDATED: Handle submit without notifications
  const handleSubmit = async (publish: boolean = false) => {
    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      if (isEditing && sceneId) {
        await handleEditUpdate();
        return;
      }
      
      const sceneData: CreateSceneData = {
        title,
        content_text: content,
        image_file: selectedImage || undefined,
        moods: selectedMoods,
        is_draft: !publish
      };

      const newScene = await createScene(sceneData);
      
      if (newScene) {
        setTitle('');
        setContent('');
        setSelectedMoods([]);
        setSelectedImage(null);
        setImagePreviewUrl('');
        setShowPublishOption(false);
        
        // UPDATED: Use alerts instead of notifications
        if (publish) {
          alert('Scene published successfully!');
        } else {
          alert('Scene saved as draft!');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('There was an error saving your scene. Please try again.');
    } finally {
      if (publish) {
        setIsPublishing(false);
      } else {
        setIsSavingDraft(false);
      }
    }
  };

  // UPDATED: Handle edit update without notifications
  const handleEditUpdate = async () => {
    if (!sceneId) return;
    
    try {
      let imagePathUpdate = undefined;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('scene-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;
        imagePathUpdate = fileName;
      }

      const updateData: any = {
        title,
        content_text: content,
        status: originalStatus,
        updated_at: new Date().toISOString()
      };

      if (imagePathUpdate) {
        updateData.image_path = imagePathUpdate;
      }

      const { error } = await supabase
        .from('scenes')
        .update(updateData)
        .eq('id', sceneId);

      if (error) throw error;

      await supabase.from('scene_moods').delete().eq('scene_id', sceneId);
      if (selectedMoods.length > 0) {
        const moodInserts = selectedMoods.map(mood => ({
          scene_id: sceneId,
          mood
        }));
        await supabase.from('scene_moods').insert(moodInserts);
      }

      // UPDATED: Use alert instead of notification
      alert('Scene updated successfully!');
      
      navigate(`/home-feed#scene-${sceneId}`);
      
    } catch (err) {
      console.error('Error updating scene:', err);
      alert('There was an error updating your scene. Please try again.');
    }
  };

  const containerStyle: React.CSSProperties = {
    width: 375,
    background: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    alignSelf: 'center',
    margin: '40px auto',
    position: 'relative'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontSize: 15,
    margin: 0,
    fontFamily: "'Cormorant', serif"
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: 220,
    resize: 'none'
  };

  // ADDED: Tab button style
  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    background: isActive ? '#1A1A1A' : '#FAF8F2',
    color: isActive ? '#FFFFFF' : '#000000',
    border: '1px solid rgba(0,0,0,0.12)',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    transition: 'all 0.2s ease'
  });

  const draftButtonStyle: React.CSSProperties = {
    width: showPublishOption ? '48%' : '100%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#FAF8F2',
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#000000',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  const publishButtonStyle: React.CSSProperties = {
    width: '48%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#1A1A1A',
    border: '1px solid #1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  const updateButtonStyle: React.CSSProperties = {
    width: '100%',
    height: 50,
    padding: '12px 16px',
    borderRadius: 10,
    background: '#1A1A1A',
    border: '1px solid #1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 20,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    transition: 'all 0.3s ease'
  };

  if (loadingScene) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF'
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#6B7280',
            fontFamily: "'Cormorant', serif"
          }}>
            Loading scene...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF'
    }}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#FAF8F2',
            border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1C1C1C',
            zIndex: 1000,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#F0EDE4';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FAF8F2';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          }}
        >
          <BackArrowIcon />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#1C1C1C',
            width: 249,
            height: 44,
            lineHeight: 'auto',
            letterSpacing: '0%',
            margin: '0 auto'
          }}>
            {isEditing ? 'Edit Scene' : 'Write a Scene'}
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 400,
            color: '#55524F',
            width: 300,
            lineHeight: 'auto',
            letterSpacing: '0%',
            margin: '16px auto 0'
          }}>
            {isEditing ? 'Update your scene' : 'What memory is sparking your imagination today?'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your scene a name..."
              required
              style={inputStyle}
            />
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your scene here..."
              required
              style={textareaStyle}
            />
          </div>

          {/* UPDATED: Image Upload Section with Preview */}
          <div onPaste={handlePaste}>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#55524F',
              marginBottom: 8
            }}>
              Scene Visual {imagePreviewUrl && '✓'}
            </label>
            
            {/* Image Preview */}
            {imagePreviewUrl && (
              <div style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                borderRadius: '12px',
                marginBottom: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={imagePreviewUrl}
                  alt="Scene preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Upload Trigger Button - Only show when no image */}
            {!imagePreviewUrl && (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#FAF8F2',
                  border: '2px dashed rgba(0,0,0,0.2)',
                  color: '#000000',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 600,
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#F0EDE4';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#FAF8F2';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)';
                }}
              >
                + Add Scene Visual
              </button>
            )}

            {/* Upload Input Options - Show when triggered */}
            {showImageInput && !imagePreviewUrl && (
              <div style={{ marginTop: '12px' }}>
                {/* Upload Method Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    style={tabButtonStyle(uploadMethod === 'file')}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    style={tabButtonStyle(uploadMethod === 'url')}
                  >
                    From URL
                  </button>
                </div>

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#FAF8F2',
                        border: '1px solid rgba(0,0,0,0.12)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontFamily: "'Cormorant', serif",
                        fontSize: '14px',
                        color: '#000000'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#FAF8F2'}
                    >
                      📁 Choose Image File
                    </button>
                    <p style={{
                      fontFamily: "'Cormorant', serif",
                      fontSize: '12px',
                      color: '#55524F',
                      textAlign: 'center',
                      marginTop: '8px',
                      marginBottom: '0'
                    }}>
                      Or paste an image (Ctrl+V) anywhere
                    </p>
                  </div>
                )}

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <UrlImageInput onAddImage={handleUrlImageAdd} />
                )}

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Cormorant', serif",
                    fontSize: '14px',
                    color: '#55524F',
                    marginTop: '8px'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsInspirationOpen(true)}
              style={{
                padding: '12px 24px',
                background: '#FAF8F2',
                border: '1px solid #D4AF37',
                borderRadius: '10px',
                color: '#1A1A1A',
                cursor: 'pointer',
                fontFamily: "'Cormorant', serif",
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#F0EDE4';
                e.currentTarget.style.borderColor = '#B8860B';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FAF8F2';
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
            >
              💡 Get Scene Inspiration
            </button>
          </div>

          {error && (
            <p style={{
              marginTop: 8,
              textAlign: 'center',
              color: '#DC2626',
              fontSize: 14,
              fontFamily: "'Cormorant', serif"
            }}>
              {error}
            </p>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '4%', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {isEditing ? (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                style={{
                  ...updateButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#2A2A2A')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#1A1A1A')}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSavingDraft || isPublishing}
                  style={{
                    ...draftButtonStyle,
                    opacity: (isSavingDraft || isPublishing) ? 0.7 : 1,
                    cursor: (isSavingDraft || isPublishing) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => !isSavingDraft && !isPublishing && (e.currentTarget.style.background = '#F0EDE4')}
                  onMouseOut={(e) => !isSavingDraft && !isPublishing && (e.currentTarget.style.background = '#FAF8F2')}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>

                {showPublishOption && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isPublishing || isSavingDraft}
                    style={{
                      ...publishButtonStyle,
                      opacity: (isPublishing || isSavingDraft) ? 0.7 : 1,
                      cursor: (isPublishing || isSavingDraft) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => !isPublishing && !isSavingDraft && (e.currentTarget.style.background = '#2A2A2A')}
                    onMouseOut={(e) => !isPublishing && !isSavingDraft && (e.currentTarget.style.background = '#1A1A1A')}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <InspirationBottomSheet
          isOpen={isInspirationOpen}
          onClose={() => setIsInspirationOpen(false)}
          onSelectPrompt={handlePromptSelect}
          prompts={promptsData.scenes}
          contentType="scenes"
        />
      </div>
    </div>
  );
};