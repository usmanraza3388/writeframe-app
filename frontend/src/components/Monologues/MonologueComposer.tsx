import React, { useState, useEffect, useRef } from 'react';
import { useMonologueComposer } from '../../hooks/useMonologueComposer';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../assets/lib/supabaseClient';
import { promptsData } from '../../data/promptsData';
import InspirationBottomSheet from '../InspirationBottomSheet/InspirationBottomSheet';

export const MonologueComposer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const monologueId = searchParams.get('id');
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnPath = location.state?.from || '/home-feed';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [showPublishOption, setShowPublishOption] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMonologue, setLoadingMonologue] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published'>('draft');
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);
  
  // ADD: Separate loading states for publish vs draft
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // ADDED: WYSIWYG Editor states
  const contentEditorRef = useRef<HTMLDivElement>(null);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [showContentPlaceholder, setShowContentPlaceholder] = useState(true);
  
  const { createMonologue, isLoading, error } = useMonologueComposer();

  // ADDED: WYSIWYG Editor handlers
  const handleFormat = (command: string, value: string = '') => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    
    document.execCommand(command, false, value);
    
    contentEditorRef.current?.focus();
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleContentInput = () => {
    if (contentEditorRef.current) {
      const contentValue = contentEditorRef.current.innerHTML;
      setContent(contentValue);
      
      const hasContent = contentValue !== '' && 
                         contentValue !== '<br>' && 
                         contentValue !== '<div><br></div>' &&
                         !contentValue.startsWith('<div></div>');
      
      setShowContentPlaceholder(!hasContent);
    }
  };

  const handleContentFocus = () => {
    setIsContentFocused(true);
    if (showContentPlaceholder && contentEditorRef.current) {
      contentEditorRef.current.innerHTML = '';
      setShowContentPlaceholder(false);
    }
  };

  const handleContentBlur = () => {
    setTimeout(() => {
      if (contentEditorRef.current && !contentEditorRef.current.contains(document.activeElement)) {
        setIsContentFocused(false);
        
        const contentValue = contentEditorRef.current.innerHTML;
        const isEmpty = contentValue === '' || 
                        contentValue === '<br>' || 
                        contentValue === '<div><br></div>' ||
                        contentValue.startsWith('<div></div>');
        
        setShowContentPlaceholder(isEmpty);
      }
    }, 100);
  };

  const handlePromptSelect = (prompt: any) => {
    if (prompt.title) {
      setTitle(prompt.title);
    }
    if (prompt.content && contentEditorRef.current) {
      contentEditorRef.current.innerHTML = prompt.content;
      setContent(prompt.content);
      setShowContentPlaceholder(false);
    }
    setIsInspirationOpen(false);
  };

  // Load existing monologue for editing
  useEffect(() => {
    const loadMonologue = async () => {
      if (!monologueId) return;
      
      try {
        setLoadingMonologue(true);
        const { data: monologue, error } = await supabase
          .from('monologues')
          .select('*')
          .eq('id', monologueId)
          .single();

        if (error) throw error;
        if (monologue) {
          setTitle(monologue.title);
          setContent(monologue.content_text || '');
          setIsEditing(true);
          setOriginalStatus(monologue.status as 'draft' | 'published');
          setShowPublishOption(false);
          
          // Set content in editor
          if (contentEditorRef.current && monologue.content_text) {
            contentEditorRef.current.innerHTML = monologue.content_text;
            setShowContentPlaceholder(false);
          }
          
          // Load emotional tone
          const { data: emotionalTags } = await supabase
            .from('monologue_emotional_tags')
            .select('emotional_tone')
            .eq('monologue_id', monologueId)
            .single();
          
          if (emotionalTags) {
            setEmotionalTone(emotionalTags.emotional_tone);
          }
        }
      } catch (err) {
        console.error('Error loading monologue:', err);
      } finally {
        setLoadingMonologue(false);
      }
    };

    loadMonologue();
  }, [monologueId]);

  // Smart button logic - show publish option when content is substantial (CREATE MODE ONLY)
  useEffect(() => {
    if (!isEditing) {
      const hasSubstantialContent = 
        title.length > 2 && 
        content.length > 10;
      
      setShowPublishOption(hasSubstantialContent);
    }
  }, [title, content, isEditing]);

  const handleBack = () => {
    const hasContent = title !== '' || content !== '' || emotionalTone !== '';
    
    if (hasContent) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your changes will not be saved.');
      if (!confirmLeave) return;
    }
    
    if (isEditing && monologueId) {
      navigate(`/home-feed#monologue-${monologueId}`);
    } else {
      navigate(returnPath);
    }
  };

  const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  // UPDATED: Handle submit with separate loading states
  const handleSubmit = async (publish: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    if (content.length > 500) {
      alert('Content must be 500 characters or less');
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
      if (isEditing && monologueId) {
        await handleEditUpdate();
        return;
      }
      
      // CREATE MODE
      await createMonologue({
        title: title.trim(),
        content_text: content.trim(),
        emotional_tone: emotionalTone || undefined,
        is_draft: !publish
      }, emotionalTone);

      // Reset form on success
      setTitle('');
      setContent('');
      setEmotionalTone('');
      setShowPublishOption(false);
      
      // Clear editor
      if (contentEditorRef.current) {
        contentEditorRef.current.innerHTML = '';
        setShowContentPlaceholder(true);
      }
      
      alert(publish ? 'Monologue published successfully!' : 'Monologue saved as draft!');
    } catch (err) {
      console.error('Failed to create monologue:', err);
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
    if (!monologueId) return;
    
    try {
      const { error } = await supabase
        .from('monologues')
        .update({
          title: title.trim(),
          content_text: content.trim(),
          status: originalStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', monologueId);

      if (error) throw error;

      // Update emotional tone
      await supabase.from('monologue_emotional_tags').delete().eq('monologue_id', monologueId);
      if (emotionalTone) {
        await supabase.from('monologue_emotional_tags').insert({
          monologue_id: monologueId,
          emotional_tone: emotionalTone
        });
      }

      alert('Monologue updated successfully!');
      
      navigate(`/home-feed#monologue-${monologueId}`);
      
    } catch (err) {
      console.error('Error updating monologue:', err);
      alert('Error updating monologue. Please try again.');
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

  // ADDED: Editor styles
  const editorStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 220,
    display: 'block',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontSize: 15,
    margin: 0,
    fontFamily: "'Cormorant', serif",
    color: '#000000',
    resize: 'none',
    overflow: 'auto',
    lineHeight: '1.4'
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    left: '16px',
    right: '16px',
    color: '#6B7280',
    fontFamily: "'Cormorant', serif",
    fontSize: 15,
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 1
  };

  const toolbarStyle: React.CSSProperties = {
    display: isContentFocused ? 'flex' : 'none',
    gap: '8px',
    padding: '8px 12px',
    background: '#FAF8F2',
    border: '1px solid rgba(0,0,0,0.12)',
    borderBottom: 'none',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: '-1px'
  };

  const formatButtonStyle: React.CSSProperties = {
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    fontWeight: 600,
    color: '#000000',
    transition: 'all 0.2s ease'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
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

  if (loadingMonologue) {
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
            Loading monologue...
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
            lineHeight: 'auto',
            letterSpacing: '0%',
            margin: '0 auto'
          }}>
            {isEditing ? 'Edit Monologue' : 'Monologue'}
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
            {isEditing ? 'Update your monologue' : 'Now, let your thoughts turn into poetic prose'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              color: '#55524F',
              marginBottom: 8
            }}>
              Give a title to your inner thought?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Photograph on the table"
              style={inputStyle}
              maxLength={100}
            />
          </div>

          {/* UPDATED: Monologue Content with WYSIWYG Editor */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              color: '#55524F',
              marginBottom: 8
            }}>
              Pour your inner world into words
            </label>
            
            {/* Formatting Toolbar */}
            <div style={toolbarStyle}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('bold');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('italic');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleFormat('insertUnorderedList');
                }}
                style={formatButtonStyle}
                onMouseOver={(e) => e.currentTarget.style.background = '#F0EDE4'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                • List
              </button>
            </div>

            {/* Editor Container */}
            <div style={{ position: 'relative' }}>
              {/* WYSIWYG Editor */}
              <div
                ref={contentEditorRef}
                contentEditable
                onInput={handleContentInput}
                onFocus={handleContentFocus}
                onBlur={handleContentBlur}
                style={editorStyle}
                suppressContentEditableWarning={true}
              />
              
              {/* Placeholder */}
              {showContentPlaceholder && (
                <div style={placeholderStyle}>
                  Express your thoughts...
                </div>
              )}
            </div>
            
            {/* Character Counter */}
            <div style={{
              textAlign: 'right',
              fontSize: 14,
              color: '#6B7280',
              marginTop: 8,
              fontFamily: "'Cormorant', serif"
            }}>
              {content.length}/500
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              color: '#55524F',
              marginBottom: 8
            }}>
              Emotional Tone
            </label>
            <select
              value={emotionalTone}
              onChange={(e) => setEmotionalTone(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select an emotional tone</option>
              <option value="Reflective">Reflective</option>
              <option value="Melancholic">Melancholic</option>
              <option value="Hopeful">Hopeful</option>
              <option value="Nostalgic">Nostalgic</option>
              <option value="Philosophical">Philosophical</option>
              <option value="Vulnerable">Vulnerable</option>
              <option value="Empowered">Empowered</option>
              <option value="Serene">Serene</option>
            </select>
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
              💡 Get Monologue Inspiration
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
                disabled={isLoading}
                style={{
                  ...updateButtonStyle,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = '#2A2A2A')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = '#1A1A1A')}
              >
                {isLoading ? 'Updating...' : 'Update'}
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
          prompts={promptsData.monologues}
          contentType="monologues"
        />
      </div>
    </div>
  );
};