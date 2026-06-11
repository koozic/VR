/* VR 전시관 앱의 루트 컴포넌트 */
import GalleryPage from './pages/GalleryPage.jsx';
import { CuratorSessionProvider } from './curator/CuratorSessionContext.jsx';

export default function App() {
  return (
    <CuratorSessionProvider>
      <GalleryPage />
    </CuratorSessionProvider>
  );
}

