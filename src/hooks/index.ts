// Barrel file — re-exports all hooks used across the app.
// Project-specific hooks
export { useScrollPosition } from "./useScrollPosition";
export { BodyScrollLock } from "./BodyScrollLock";

// Re-exports from vendored usehooks (all hooks)
export {
  useBattery,
  useClickAway,
  useCopyToClipboard,
  useCounter,
  useDebounce,
  useDefault,
  useDocumentTitle,
  useFavicon,
  useGeolocation,
  useHistoryState,
  useHover,
  useIdle,
  useIntersectionObserver,
  useIsClient,
  useIsFirstRender,
  useList,
  useLocalStorage,
  useLockBodyScroll,
  useLongPress,
  useMap,
  useMeasure,
  useMediaQuery,
  useMouse,
  useNetworkState,
  useObjectState,
  useOrientation,
  usePreferredLanguage,
  usePrevious,
  useQueue,
  useRenderCount,
  useRenderInfo,
  useScript,
  useSessionStorage,
  useSet,
  useThrottle,
  useToggle,
  useVisibilityChange,
  useWindowScroll,
  useWindowSize,
} from "./usehooks";

// Re-export types
export type {
  BatteryManager,
  CustomList,
  CustomQueue,
  GeolocationState,
  HistoryState,
  LongPressFns,
  LongPressOptions,
  MousePosition,
  NetworkState,
  RenderInfo,
  SpeechOptions,
  SpeechState,
} from "./usehooks";
