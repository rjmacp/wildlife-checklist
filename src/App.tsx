import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ParkPage from './pages/ParkPage';
import BrowsePage from './pages/BrowsePage';
import AnimalProfilePage from './pages/AnimalProfilePage';
import { useTheme } from './hooks/useTheme';
import Lightbox from './components/common/Lightbox';
import SettingsModal from './components/common/SettingsModal';
import ParkPicker from './components/common/ParkPicker';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/park/:parkId" element={<ParkPage />} />
          <Route path="/animal/:animalId" element={<AnimalProfilePage />} />
        </Routes>
      </ErrorBoundary>
      <Lightbox />
      <ParkPicker />
      <SettingsModal theme={theme} onToggleTheme={toggleTheme} />
    </>
  );
}
