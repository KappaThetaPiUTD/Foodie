import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import PillNav from '../src/components/PillNav';
import { motion } from 'framer-motion';
import CardSwap, { Card } from '../src/components/CardSwap';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/maps');
    }
  }, [currentUser, router]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (e) {
      // no-op
    }
  };

  const teamMembers = [
    { name: 'Aadhav Manimurugan', role: 'Full Stack Developer', link: 'https://www.linkedin.com/in/aadhav-/', image: '/team/Aadhav.jpeg' },
    { name: 'Ishaan Dhandapani', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/ishaandhandapani/', image: '/team/Ishaan.jpeg' },
    { name: 'Vignesh Selvam', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/vignesh-2004-selvam/', image: '/team/Vignesh.jpeg' },
    { name: 'Ethan Lobo', role: 'Frontend Developer', link: 'https://www.linkedin.com/in/ethanlobo/', image: '/team/Ethan.jpeg' },
    { name: 'Ajay Kumaran', role: 'UI/UX Designer', link: 'https://www.linkedin.com/in/ajay-kumaran/', image: '/team/Ajay.jpeg' },
  ];

  // Configure navigation items based on auth state
  const navItems = currentUser ? [
    { href: '/landing', label: 'Landing' },
    { href: '/profile', label: 'Profile' },
    { label: 'Logout', onClick: handleLogout }
  ] : [
    { href: '/landing', label: 'Landing' },
    { href: '/login', label: 'Login' }
  ];

  return (
    <>
      <PillNav
        logo="/FoodieLogo.png"
        logoAlt="FoodieMaps"
        items={navItems}
        activeHref={router.pathname}
        baseColor="#111827"
        pillColor="#16a34a"
        hoveredPillTextColor="#111827"
        pillTextColor="#111827"
      />
      <div style={{
        minHeight: '100vh',
        background: '#ffffff'
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
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
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
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              marginBottom: '24px',
              letterSpacing: '-1px',
              color: '#0f172a'
            }}
          >
            FoodieMaps
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              fontSize: '1.5rem',
              marginBottom: '48px',
              lineHeight: '1.6',
              fontWeight: '300',
              color: '#1f2937'
            }}
          >
            Finding the perfect restaurant for your group has never been easier.
            FoodieMaps brings together everyone's preferences to discover dining spots
            that satisfy the entire party.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
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
              transition: 'box-shadow 0.3s ease'
            }}
          >
            Get Started
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{
              fontSize: '0.95rem',
              color: '#374151',
              marginTop: '24px'
            }}
          >
            Free to use • No credit card required
          </motion.p>
        </motion.div>
      </section>

      {/* Combined How to Use & What We're Working On Section */}
      <section style={{
        padding: '80px 20px',
        background: '#f9fafb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '60px',
            alignItems: 'start'
          }}>
            {/* Left: How to Use */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <span style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#16a34a'
                }}>
                  How it works
                </span>
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  Plan a restaurant night in 3 steps
                </h2>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                  Invite your friends, sync preferences, and let FoodieMaps surface the best spots.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#111827'
                  }}>
                    Create or Join Session
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                  }}>
                    Start a new dining session or join an existing one using a unique session code.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#111827'
                  }}>
                    Set Your Preferences
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                  }}>
                    Enter your location, select cuisine types, dietary restrictions, and budget range.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #86efac 0%, #bbf7d0 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#111827'
                  }}>
                    Discover Restaurants
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.6'
                  }}>
                    Our algorithm finds restaurants that match everyone's preferences and shows them on the map.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right: CardSwap with What We're Working On */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <span style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#6366f1'
                }}>
                  What's coming
                </span>
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  Features on the near-term roadmap
                </h2>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                  Here’s what the team is iterating on right now!
                </p>
              </motion.div>

              <div style={{
                height: '520px',
                position: 'relative',
                marginTop: '100px',
                marginLeft: '180px',
                overflow: 'visible'
              }}>
                <CardSwap
                  width={540}
                  height={360}
                  cardDistance={40}
                  verticalDistance={45}
                  delay={4200}
                  pauseOnHover={true}
                  easing="power"
                >
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Real-time Voting System</h3>
                    <p>Allow group members to vote on restaurant options in real-time.</p>
                  </Card>
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Advanced Filtering</h3>
                    <p>Filter by ratings, distance, price range, and availability.</p>
                  </Card>
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Reservation Integration</h3>
                    <p>Book tables directly through the app once your group decides.</p>
                  </Card>
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Saved Favorites</h3>
                    <p>Save your favorite restaurants and create custom lists.</p>
                  </Card>
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Mobile App</h3>
                    <p>Native iOS and Android apps for a seamless mobile experience.</p>
                  </Card>
                  <Card style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}>
                    <h3>Social Features</h3>
                    <p>Share dining experiences and restaurant reviews with friends.</p>
                  </Card>
                </CardSwap>
              </div>
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
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '48px'
            }}
          >
            Meet the Team
          </motion.h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            padding: '0 20px'
          }}>
            {teamMembers.map((member, index) => (
              <motion.a
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={member.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  padding: '32px 24px',
                  borderRadius: '20px',
                  border: '1px solid rgba(17,24,39,0.08)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#111827',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '170px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(180,83,9,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(180,83,9,0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(17,24,39,0.08)';
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid rgba(180,83,9,0.12)',
                    margin: '0 auto',
                    transition: 'border-color 0.3s ease'
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
                        fontSize: '1.6rem'
                      }}>
                        {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                  color: '#111827',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {member.name}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginBottom: '20px',
                  lineHeight: '1.4',
                  height: '22px'
                }}>
                  {member.role}
                </p>
                <span style={{
                  fontSize: '0.85rem',
                  color: '#b45309',
                  fontWeight: '600'
                }}>
                  View profile →
                </span>
              </motion.a>
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
    </>
  );
}
