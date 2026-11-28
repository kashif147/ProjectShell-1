// Stub for @react-google-maps/api: no Maps script is loaded inside designs.
export const useJsApiLoader = () => ({ isLoaded: false, loadError: undefined });
export const useLoadScript = () => ({ isLoaded: false, loadError: undefined });
export const StandaloneSearchBox = ({ children }) => children ?? null;
export const Autocomplete = ({ children }) => children ?? null;
export const GoogleMap = () => null;
export const Marker = () => null;
export const LoadScript = ({ children }) => children ?? null;
