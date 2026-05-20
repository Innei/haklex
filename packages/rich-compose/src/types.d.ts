// Allow packages to side-effect-import raw CSS files (e.g. a renderer entry
// doing `import './styles.css'`). Only needed because tsc walks workspace
// source recursively when verifying downstream consumers — bundlers handle
// CSS imports natively.
declare module '*.css';
