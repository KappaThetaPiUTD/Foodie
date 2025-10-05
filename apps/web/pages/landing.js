import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/maps');
    }
  }, [currentUser, router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const teamMembers = [
    { name: 'Aadhav Manimurugan', role: 'Full Stack Developer', link: 'https://aadhavmani.com/', image: '' },
    { name: 'Ishaan Dhandapani', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/ishaandhandapani/', image: '' },
    { name: 'Vignesh Selvam', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/vignesh-2004-selvam/', image: '' },
    { name: 'Ethan Lobo', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/ethanlobo/', image: '' },
    { name: 'Ajay Kumaran', role: 'UI/UX Designer', link: 'https://www.linkedin.com/in/ajay-kumaran/', image: '' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      paddingTop: '80px' // Space for header
    }}>
      {/* Hero Section - What We Are & Login */}
      <section style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#111827'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Logo */}
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src="/FoodieLogo.png" 
              alt="FoodieMaps Logo" 
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                background: 'white',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            />
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            marginBottom: '24px',
            letterSpacing: '-1px',
            color: '#0f172a'
          }}>
            FoodieMaps
          </h1>

          <p style={{
            fontSize: '1.5rem',
            marginBottom: '48px',
            lineHeight: '1.6',
            fontWeight: '300',
            color: '#1f2937'
          }}>
            Finding the perfect restaurant for your group has never been easier. 
            FoodieMaps brings together everyone's preferences to discover dining spots 
            that satisfy the entire party.
          </p>

        <button
          onClick={handleGetStarted}
          style={{
            backgroundColor: 'white',
              color: '#16a34a',
            border: 'none',
              padding: '18px 48px',
              borderRadius: '12px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
        >
            Get Started
        </button>

        <p style={{
            fontSize: '0.95rem',
            color: '#374151',
          marginTop: '24px'
        }}>
            Free to use • No credit card required
          </p>
        </div>
      </section>

      {/* How to Use Section */}
      <section style={{
        padding: '80px 20px',
        background: '#f9fafb'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#111827'
          }}>
            How to Use FoodieMaps
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#065f46',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Create or Join Session
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Start a new dining session or join an existing one using a unique session code.
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#065f46',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Set Your Preferences
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Enter your location, select cuisine types, dietary restrictions, and budget range.
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#065f46',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Discover Restaurants
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Our algorithm finds restaurants that match everyone's preferences and shows them on the map.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work in Progress Section */}
      <section style={{
        padding: '80px 20px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '24px',
            color: '#111827'
          }}>
            What We're Working On
          </h2>
          <p style={{
            fontSize: '1.1rem',
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            We're constantly improving FoodieMaps. Here's what's coming next:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Real-time Voting System
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Allow group members to vote on restaurant options in real-time.
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Advanced Filtering
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Filter by ratings, distance, price range, and availability.
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Reservation Integration
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Book tables directly through the app once your group decides.
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Saved Favorites
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Save your favorite restaurants and create custom lists.
              </p>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Mobile App
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Native iOS and Android apps for a seamless mobile experience.
        </p>
      </div>

            <div style={{
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#111827'
              }}>
                Social Features
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Share dining experiences and restaurant reviews with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section style={{
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
        color: '#111827'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            Meet the Team
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            marginBottom: '48px'
          }}>
            {teamMembers.map((member, index) => (
              <a
                key={index}
                href={member.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  padding: '28px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(17,24,39,0.08)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#111827',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid rgba(17,24,39,0.08)',
                    margin: '0 auto'
                  }}>
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={`${member.name} photo`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(253,230,138,0.7) 0%, rgba(253,186,116,0.5) 100%)',
                        color: '#111827',
                        fontWeight: 700,
                        fontSize: '1.25rem'
                      }}>
                        {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '6px'
                }}>
                  {member.name}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {member.role}
                </p>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#b45309',
                  textDecoration: 'underline'
                }}>
                  View profile →
                </span>
              </a>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              Made by members of <a href="https://www.utdktp.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#b45309', textDecoration: 'underline' }}>Kappa Theta Pi UTD</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 20px',
        background: '#111827',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <p>
          Powered by Google Maps & Places API • Built with React & Next.js
        </p>
        <p style={{ marginTop: '8px' }}>
          © 2025 FoodieMaps. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
