import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
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
          Terms of Service
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px' }}>

        {/* Intro */}
        <div style={{
          backgroundColor: '#FAF8F2',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '32px',
          borderLeft: '3px solid rgba(212, 175, 55, 0.3)'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            lineHeight: 1.3
          }}>
            Your creative work belongs to you. Always.
          </h2>
          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#55524F',
            margin: 0
          }}>
            writeFrame is a platform built for creators. These terms are written in plain language
            to be honest and clear about how we operate — not to confuse you with legal jargon.
            This is an MVP and these terms will evolve, but our core commitment never will:
            everything you create is yours.
          </p>
        </div>

        {/* Section 1: Ownership */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            1. You Own Your Content
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
              margin: '0 0 12px 0'
            }}>
              All content you post on writeFrame — scenes, monologues, characters, cinematic
              collages, or any other creative work — remains your exclusive property. writeFrame
              claims zero ownership rights to anything you create.
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: '0 0 12px 0'
            }}>
              By posting, you grant writeFrame only a limited, non-exclusive license to display
              your content on the platform so other users can see it. That's it. We do not sell,
              license, or use your work for any other purpose.
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: 0
            }}>
              You may remove your content at any time. Once deleted, it is removed from our
              platform immediately.
            </p>
          </div>
        </section>

        {/* Section 2: Timestamps */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            2. Timestamps as Protection
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
              margin: '0 0 12px 0'
            }}>
              Every post on writeFrame is automatically timestamped at the moment of creation.
              This establishes a public record of when your work was created and can serve as
              evidence of "prior art" in copyright disputes.
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: 0
            }}>
              While writeFrame cannot prevent unauthorized use of publicly posted content,
              timestamps can support your copyright claims if disputes arise.
            </p>
          </div>
        </section>

        {/* Section 3: DMCA */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            3. Reporting Plagiarism
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
              margin: '0 0 12px 0'
            }}>
              If you believe your work has been plagiarized on writeFrame, use the Report button
              on any post. We take copyright seriously and will investigate all claims.
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: '0 0 12px 0'
            }}>
              To file a claim, provide evidence of your original creation — an earlier timestamp,
              original file, or other proof. We will review and remove infringing content and
              may ban repeat offenders.
            </p>
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#1C1C1C',
                margin: 0,
                fontWeight: '500'
              }}>
                Contact us at:{' '}
                <a
                  href="mailto:hello@writeframe.app"
                  style={{ color: '#1C1C1C', textDecoration: 'underline' }}
                >
                  hello@writeframe.app
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Public Sharing */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            4. The Reality of Public Sharing
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
              margin: '0 0 12px 0'
            }}>
              Any public platform — Instagram, Twitter, Medium, Behance — carries some inherent
              risk of content theft. writeFrame is no different. We are honest about this.
            </p>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: 0
            }}>
              What we provide to minimise this risk: timestamps, attribution tools, and a
              takedown process. Many creators choose to share work publicly to build portfolios
              and audiences — it is a calculated decision, and you are always in control of
              what you share.
            </p>
          </div>
        </section>

        {/* Section 5: Platform Rules */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            5. Platform Rules
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
              margin: '0 0 12px 0'
            }}>
              To keep writeFrame a safe and creative space, the following content is not allowed:
            </p>
            <ul style={{
              margin: '0',
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#55524F',
              lineHeight: 1.8
            }}>
              <li>Content that infringes on another person's copyright</li>
              <li>Hate speech, harassment, or content targeting individuals</li>
              <li>Spam, misleading content, or impersonation</li>
              <li>Content that violates applicable laws</li>
            </ul>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#55524F',
              margin: '12px 0 0 0'
            }}>
              Violations may result in content removal or account termination at our discretion.
            </p>
          </div>
        </section>

        {/* IP Protection FAQ */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            IP Protection FAQ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: 'Who owns the content I post?',
                a: 'You do. 100%. writeFrame claims zero ownership over anything you create and post on the platform.'
              },
              {
                q: 'Can someone steal my work from writeFrame?',
                a: 'Any public platform carries this risk. We provide timestamps, attribution tools, and a DMCA takedown process to minimise it. You control what you share publicly.'
              },
              {
                q: 'How does the timestamp protect me?',
                a: 'Each post is timestamped when created, establishing prior art — proof you created it first. This can support copyright claims if a dispute arises.'
              },
              {
                q: 'What if I see my work plagiarised on writeFrame?',
                a: 'Use the Report button on the post. We investigate all claims and aim to remove infringing content promptly. You can also email us at hello@writeframe.app.'
              },
              {
                q: 'Should I post my best ideas publicly?',
                a: "That's your decision. Many creators share scenes and characters to build portfolios while keeping full scripts private. You control what you share."
              },
              {
                q: 'Can I delete my work at any time?',
                a: "Yes. You can delete any post instantly. Once deleted, it is removed from our platform. We cannot control screenshots others may have already taken."
              }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#FAF8F2',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E5E5'
                }}
              >
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1C1C1C',
                  margin: '0 0 8px 0',
                  lineHeight: 1.4
                }}>
                  {item.q}
                </p>
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#55524F',
                  margin: 0
                }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Changes to Terms */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1C1C1C',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            6. Changes to These Terms
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
              writeFrame is an MVP and these terms will evolve as the platform grows. We will
              notify users of any significant changes. Continuing to use writeFrame after changes
              are posted means you accept the updated terms. Our core commitment — that your
              content belongs to you — will never change.
            </p>
          </div>
        </section>

        {/* Contact */}
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
            Questions?
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#55524F',
            margin: '0 0 16px 0',
            lineHeight: 1.5
          }}>
            We're always happy to talk. Reach out anytime.
          </p>
          <a
            href="mailto:hello@writeframe.app"
            style={{
              display: 'block',
              padding: '14px',
              backgroundColor: '#1C1C1C',
              color: '#FFFFFF',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            hello@writeframe.app
          </a>
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
            margin: '0 0 8px 0'
          }}>
            Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </p>
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

export default TermsPage;