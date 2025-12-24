// src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header - Matches HomeFeed design */}
      <div style={{
        padding: '20px 16px 16px 16px',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#55524F',
              fontSize: '14px'
            }}
          >
            <span style={{ fontSize: '18px' }}>←</span>
            <span>Back</span>
          </Link>
          
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#1C1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/favicon.ico" 
              alt="writeFrame"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
        
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1C1C1C',
          margin: 0
        }}>
          About writeFrame
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px' }}>
        
        {/* Hero Statement */}
        <div style={{
          backgroundColor: '#FAF8F2',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '32px',
          borderLeft: '3px solid rgba(212, 175, 55, 0.3)'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            lineHeight: 1.3
          }}>
            The New Home for Indie Cinematic Creators
          </h2>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#55524F',
            margin: '0 0 16px 0'
          }}>
            Where cinematic scenes, stories, and voices come alive. Built for the next wave of 
            filmmakers, writers, and visual storytellers.
          </p>
          
          <div style={{
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1C1C1C',
              margin: '0 0 8px 0'
            }}>
              A creative space to:
            </p>
            <ul style={{
              margin: '0',
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#55524F',
              lineHeight: 1.6
            }}>
              <li>Create and showcase cinematic scene cards</li>
              <li>Design characters and craft monologues</li>
              <li>Build cinematic mood boards</li>
              <li>Build your creative identity and audience</li>
              <li>Connect with other storytellers</li>
            </ul>
          </div>
        </div>

        {/* The Problem */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            The Problem We Solve
          </h3>
          <div style={{
            backgroundColor: '#FAF8F2',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E5E5E5'
          }}>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: 0
            }}>
              Every filmmaker, writer, and cinephile starts with fragments: a character sketch, 
              a powerful monologue, a scene that plays in your head. But where do you share these 
              beginnings without a full screenplay? How do you build a portfolio when you're just 
              starting out?
            </p>
          </div>
        </section>

        {/* The New Era of Independent Cinema */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            The New Era of Independent Cinema
          </h3>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid rgba(212, 175, 55, 0.15)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '32px',
              opacity: 0.1
            }}>
              🎥
            </div>
            
            <p style={{
              fontFamily: 'Cormorant, serif',
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#1C1C1C',
              margin: '0 0 16px 0',
              position: 'relative',
              zIndex: 1
            }}>
              writeFrame is not just another creative platform. It is the foundation of a new cinematic movement.
            </p>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#55524F',
                margin: '0 0 12px 0'
              }}>
                A world where stories do not need studios to exist. Where creators own their work, 
                their audience, and their voice.
              </p>
              
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                padding: '16px',
                borderRadius: '8px',
                margin: '16px 0',
                borderLeft: '3px solid rgba(212, 175, 55, 0.3)'
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1C1C1C',
                  margin: '0 0 8px 0'
                }}>
                  Your Creative IP, Protected
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#55524F',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Every scene, character, and monologue you build belongs to you. Your creative IP is protected and credited.
                </p>
              </div>
              
              <p style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#55524F',
                margin: '16px 0 0 0',
                fontStyle: 'italic'
              }}>
                This is how cinema evolves: frame by frame, creator by creator. This is only the beginning.
              </p>
            </div>
          </div>
        </section>

        {/* Be Part of the First 100 Creators */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{
            backgroundColor: '#1C1C1C',
            color: '#FFFFFF',
            padding: '24px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(212, 175, 55, 0.2)',
              borderRadius: '50%'
            }}></div>
            
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
              position: 'relative',
              zIndex: 1
            }}>
              Be Part of the First 100 Creators
            </h3>
            <p style={{
              fontSize: '14px',
              opacity: 0.9,
              margin: '0 0 20px 0',
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 1
            }}>
              Join and help shape the future of cinematic storytelling.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '13px' }}>Lifetime early badge on profile</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '13px' }}>Spotlight in our launch showcase</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '13px' }}>Direct influence on features</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            How It Works
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {[
              { number: '1', title: 'Create', desc: 'Write a scene, monologue, character sketch, or describe a visual frame.' },
              { number: '2', title: 'Share', desc: 'Add it to your public portfolio. No finished script required.' },
              { number: '3', title: 'Connect', desc: 'Find inspiration, feedback, and collaborators in our community.' }
            ].map((step) => (
              <div 
                key={step.number}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1C1C1C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {step.number}
                </div>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1C1C1C',
                    margin: '0 0 4px 0'
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: '#55524F',
                    margin: 0
                  }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who It's For */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Who It's For
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {[
              { emoji: '🎬', title: 'Cinephiles', desc: 'Explore creativity' },
              { emoji: '✍️', title: 'Writers', desc: 'Build your portfolio' },
              { emoji: '🎥', title: 'Filmmakers', desc: 'Find collaborators' },
              { emoji: '🎓', title: 'Students', desc: 'Practice the craft' }
            ].map((persona) => (
              <div 
                key={persona.title}
                style={{
                  backgroundColor: '#FAF8F2',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E5E5',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {persona.emoji}
                </div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1C1C1C',
                  margin: '0 0 4px 0'
                }}>
                  {persona.title}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#55524F',
                  margin: 0
                }}>
                  {persona.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder's Note */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            From Our Founder
          </h3>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #E5E5E5',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              backgroundColor: '#FFFFFF',
              padding: '0 8px',
              fontSize: '12px',
              color: '#55524F',
              fontStyle: 'italic'
            }}>
              A personal note
            </div>
            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#1C1C1C',
              margin: '0 0 16px 0'
            }}>
              "As a film lover, I wanted a space where raw ideas are celebrated—not just polished scripts. 
              writeFrame is the community I wished existed when I was starting out."
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #E5E5E5'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1C1C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 'bold'
              }}>
                UR
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1C1C1C',
                  margin: '0 0 2px 0'
                }}>
                  Usman Raza
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#55524F',
                  margin: 0
                }}>
                  Founder, writeFrame
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div style={{
          backgroundColor: '#FAF8F2',
          padding: '24px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '32px',
          border: '1px solid #E5E5E5'
        }}>
          <h4 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1C1C1C',
            margin: '0 0 12px 0'
          }}>
            Ready to Begin?
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#55524F',
            margin: '0 0 20px 0',
            lineHeight: 1.5
          }}>
            No finished work required. Just your next idea.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <Link 
              to="/signup"
              style={{
                display: 'block',
                padding: '16px',
                backgroundColor: '#1C1C1C',
                color: '#FFFFFF',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C1C1C'}
            >
              Start Creating Free
            </Link>
            <Link 
              to="/home-feed"
              style={{
                display: 'block',
                padding: '14px',
                backgroundColor: 'transparent',
                color: '#55524F',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '14px',
                border: '1px solid #E5E5E5',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FAF8F2';
                e.currentTarget.style.borderColor = '#1C1C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#E5E5E5';
              }}
            >
              Browse Community Work First
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #E5E5E5'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#AAA',
            margin: 0
          }}>
            © {new Date().getFullYear()} writeFrame
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;