import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../src/components/Map'), { ssr: false });

export default function HomePage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Foodie Map</h1>
      <p>Enter the same session ID in two browsers to share routes live.</p>
      <div style={{ marginTop: 16 }}>
        <Map />
      </div>
    </div>
  );
}


