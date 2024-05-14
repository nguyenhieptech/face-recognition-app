import { HomePage } from "@/pages/home";
import { AppProvider } from "@/providers/app-provider";

function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}

export default App;
