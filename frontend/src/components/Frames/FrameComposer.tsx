import React, { useState, useRef, useEffect } from 'react';
import { useFrameComposer } from '../../hooks/useFrameComposer';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../assets/lib/supabaseClient';
import { promptsData } from '../../data/promptsData';
import InspirationBottomSheet from '../InspirationBottomSheet/InspirationBottomSheet';

const FrameComposer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const frameId = searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnPath = location.state?.from || '/home-feed';
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [moodDescription, setMoodDescription] = useState('');
  const { createFrame, isLoading, error } = useFrameComposer();
  const [showPublishOption, setShowPublishOption] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published'>('draft');
  
  // ADD: Separate loading states for publish vs draft
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  const [isInspirationOpen, setIsInspirationOpen] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptSelect = (prompt: any) => {
    if (prompt.mood) {
      setMoodDescription(prompt.mood);
    }
    setIsInspirationOpen(false);
  };

  // Load existing frame for editing
  useEffect(() => {
    const loadFrame = async () => {
      if (!frameId) return;
      
      try {
        setLoadingFrame(true);
        const { data: frame, error } = await supabase
          .from('frames')
          .select('*')
          .eq('id', frameId)
          .single();

        if (error) throw error;
        if (frame) {
          if (frame.image_urls && frame.image_urls.length > 0) {
            setImageUrls(frame.image_urls);
          }
          setMoodDescription(frame.mood_description || '');
          setIsEditing(true);
          setOriginalStatus(frame.status as 'draft' | 'published');
          setShowPublishOption(false);
        }
      } catch (err) {
        console.error('Error loading frame:', err);
      } finally {
        setLoadingFrame(false);
      }
    };

    loadFrame();
  }, [frameId]);

  // Smart button logic - show publish option when content is substantial (CREATE MODE ONLY)
  useEffect(() => {
    if (!isEditing) {
      const hasSubstantialContent = 
        imageUrls.length > 0 && 
        moodDescription.length > 5;
      
      setShowPublishOption(hasSubstantialContent);
    }
  }, [imageUrls, moodDescription, isEditing]);

  const handleBack = () => {
    const hasContent = imageUrls.length > 0 || moodDescription !== '';
    
    if (hasContent) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your changes will not be saved.');
      if (!confirmLeave) return;
    }
    
    if (isEditing && frameId) {
      navigate(`/home-feed#frame-${frameId}`);
    } else {
      navigate(returnPath);
    }
  };

  const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const positionLabels = ['Main', 'Support', 'Mood', 'Style'];

  const handleAddImage = (imageUrl: string) => {
    if (imageUrls.length < 4) {
      setImageUrls([...imageUrls, imageUrl]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const availableSlots = 4 - imageUrls.length;
    const filesToProcess = files.slice(0, availableSlots);
    
    if (filesToProcess.length === 0) {
      alert('No available slots for new images');
      return;
    }

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select image files only');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        handleAddImage(imageUrl);
      };
      reader.readAsDataURL(file);
    });

    if (files.length > availableSlots) {
      alert(`Added ${filesToProcess.length} images. ${files.length - availableSlots} files skipped (maximum 4 images).`);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // UPDATED: Handle submit with separate loading states
  const handleSubmit = async (publish: boolean = false) => {
    if (imageUrls.length === 0) {
      alert('Please add at least one image');
      return;
    }

    // Set the correct loading state
    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      // EDIT MODE: Completely separate logic
      if (isEditing && frameId) {
        await handleEditUpdate();
        return;
      }
      
      // CREATE MODE
      const frameData = {
        image_urls: imageUrls,
        mood_description: moodDescription,
        title: undefined,
        status: publish ? 'published' as const : 'draft' as const,
      };

      const result = await createFrame(frameData);
      
      if (result) {
        setImageUrls([]);
        setMoodDescription('');
        setShowPublishOption(false);
        alert(publish ? 'Collage published successfully!' : 'Collage saved as draft!');
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      // Reset the correct loading state
      if (publish) {
        setIsPublishing(false);
      } else {
        setIsSavingDraft(false);
      }
    }
  };

  const handleEditUpdate = async () => {
    if (!frameId) return;
    
    try {
      const { error } = await supabase
        .from('frames')
        .update({
          image_urls: imageUrls,
          mood_description: moodDescription,
          status: originalStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', frameId);

      if (error) throw error;

      alert('Collage updated successfully!');
      
      navigate(`/home-feed#frame-${frameId}`);
      
    } catch (err) {
      console.error('Error updating frame:', err);
      alert('Error updating collage. Please try again.');
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
    overflow: 'clip',
    position: 'relative'
  };

  const textareaStyle: React.CSSProperties = {
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
    fontFamily: "'Garamond', serif",
    color: '#000000',
    height: 48,
    resize: 'none'
  };

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

  const placeholderStyles = [
    { width: 152, height: 133 },
    { width: 152, height: 99 },
    { width: 152, height: 70 },
    { width: 152, height: 106 }
  ];

  const renderImagePlaceholder = (position: number) => {
    const hasImage = imageUrls[position];
    
    return (
      <div style={{ position: 'relative' }}>
        {!hasImage && (
          <div style={{
            position: 'absolute',
            top: -20,
            left: 0,
            fontSize: 11,
            color: '#55524F',
            background: '#FAF8F2',
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.1)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            zIndex: 2
          }}>
            {positionLabels[position]}
          </div>
        )}
        
        <div
          style={{
            width: placeholderStyles[position].width,
            height: placeholderStyles[position].height,
            border: hasImage ? '2px solid rgba(0,0,0,0.12)' : '2px dashed rgba(0,0,0,0.12)',
            borderRadius: 12,
            background: hasImage ? 'transparent' : '#FAF8F2',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {hasImage ? (
            <>
              <img 
                src={imageUrls[position]} 
                alt={`Reference ${position + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(position)}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 3
                }}
              >
                ×
              </button>
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5
            }}>
              <div style={{
                width: 24,
                height: 24,
                background: 'rgba(0,0,0,0.1)',
                borderRadius: 4
              }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loadingFrame) {
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
            Loading collage...
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#1C1C1C',
            lineHeight: 'auto',
            letterSpacing: '10%',
            margin: '0 auto'
          }}>
            {isEditing ? 'Edit Collage' : 'Cinematic Collage'}
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 400,
            color: '#55524F',
            lineHeight: 'auto',
            letterSpacing: '0%',
            margin: '16px auto 0'
          }}>
            {isEditing ? 'Update your collage' : 'Collect and curate your inspirations'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#55524F',
              marginBottom: 8,
              lineHeight: '15px'
            }}>
              Describe your mood or muse?
            </label>
            <textarea
              value={moodDescription}
              onChange={(e) => setMoodDescription(e.target.value)}
              placeholder="What's the story behind these images?"
              style={textareaStyle}
              rows={1}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#55524F',
              marginBottom: 8,
              lineHeight: '15px'
            }}>
              Visual References {imageUrls.length > 0 && `(${imageUrls.length}/4)`}
            </label>
            
            <button
              type="button"
              onClick={handleFileSelect}
              disabled={imageUrls.length >= 4}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 20,
                background: imageUrls.length >= 4 ? '#F0EDE4' : '#FAF8F2',
                border: '2px solid #000000',
                color: '#000000',
                cursor: imageUrls.length >= 4 ? 'not-allowed' : 'pointer',
                fontSize: 24,
                fontFamily: "'Cormorant', serif",
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '10%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
                opacity: imageUrls.length >= 4 ? 0.6 : 1
              }}
              onMouseOver={(e) => imageUrls.length < 4 && (e.currentTarget.style.background = '#F0EDE4')}
              onMouseOut={(e) => imageUrls.length < 4 && (e.currentTarget.style.background = '#FAF8F2')}
            >
              <span>+</span>
              <span style={{ fontSize: 15 }}>
                {imageUrls.length >= 4 ? 'Collage Full' : 'Add Image'}
              </span>
            </button>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gridTemplateRows: 'auto auto',
              gap: '12px 12px',
              width: '100%'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12 
              }}>
                {renderImagePlaceholder(0)}
                {renderImagePlaceholder(2)}
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12 
              }}>
                {renderImagePlaceholder(1)}
                {renderImagePlaceholder(3)}
              </div>
            </div>
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
              💡 Get Mood Inspiration
            </button>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: 8,
              fontFamily: "'Cormorant', serif",
              fontSize: 14
            }}>
              {error}
            </div>
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
                disabled={isLoading || imageUrls.length === 0}
                style={{
                  ...updateButtonStyle,
                  opacity: isLoading || imageUrls.length === 0 ? 0.7 : 1,
                  cursor: isLoading || imageUrls.length === 0 ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !isLoading && imageUrls.length > 0 && (e.currentTarget.style.background = '#2A2A2A')}
                onMouseOut={(e) => !isLoading && imageUrls.length > 0 && (e.currentTarget.style.background = '#1A1A1A')}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSavingDraft || isPublishing || imageUrls.length === 0}
                  style={{
                    ...draftButtonStyle,
                    opacity: (isSavingDraft || isPublishing || imageUrls.length === 0) ? 0.7 : 1,
                    cursor: (isSavingDraft || isPublishing || imageUrls.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => !isSavingDraft && !isPublishing && imageUrls.length > 0 && (e.currentTarget.style.background = '#F0EDE4')}
                  onMouseOut={(e) => !isSavingDraft && !isPublishing && imageUrls.length > 0 && (e.currentTarget.style.background = '#FAF8F2')}
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>

                {showPublishOption && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isPublishing || isSavingDraft || imageUrls.length === 0}
                    style={{
                      ...publishButtonStyle,
                      opacity: (isPublishing || isSavingDraft || imageUrls.length === 0) ? 0.7 : 1,
                      cursor: (isPublishing || isSavingDraft || imageUrls.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => !isPublishing && !isSavingDraft && imageUrls.length > 0 && (e.currentTarget.style.background = '#2A2A2A')}
                    onMouseOut={(e) => !isPublishing && !isSavingDraft && imageUrls.length > 0 && (e.currentTarget.style.background = '#1A1A1A')}
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
          prompts={promptsData.frames}
          contentType="frames"
        />
      </div>
    </div>
  );
};

export default FrameComposer;