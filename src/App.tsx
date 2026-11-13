import { RouterView } from "./router";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
    return (
        <ErrorBoundary>
            <RouterView />
        </ErrorBoundary>
    );
}

export default App;
