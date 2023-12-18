import { HomePage } from '@/pages';
import { AppProvider } from '@/providers';

function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}

export default App;
