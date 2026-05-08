// Allow upstream packages to side-effect-import CSS files (e.g., gallery
// pulls 'react-photo-view/dist/react-photo-view.css'). This declaration is
// only needed because tsc walks workspace source recursively when verifying
// downstream consumers — bundlers handle CSS imports natively.
declare module '*.css';
