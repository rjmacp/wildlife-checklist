import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ParkPage from './pages/ParkPage';
import BrowsePage from './pages/BrowsePage';
import AnimalProfilePage from './pages/AnimalProfilePage';
import SafariLogPage from './pages/SafariLogPage';
import { useTheme } from './hooks/useTheme';
import Lightbox from './components/common/Lightbox';
import SettingsModal from './components/common/SettingsModal';
import ParkPicker from './components/common/ParkPicker';
import SafariStory from './components/common/SafariStory';
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
          <Route path="/log" element={<SafariLogPage />} />
        </Routes>
      </ErrorBoundary>
      <Lightbox />
      <ParkPicker />
      <SafariStory />
      <SettingsModal theme={theme} onToggleTheme={toggleTheme} />
    </>
  );
}
