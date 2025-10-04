import '../src/styles/globals.css';
import { AuthProvider } from '../src/context/AuthContext';
import Header from '../src/components/Header';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
