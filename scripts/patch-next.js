/**
 * Safe patch script for Next.js 16 with React 19 App Router build
 * Ensures static prerendering of /_global-error does not fail on null dispatcher
 */
const fs = require('fs');
const path = require('path');

function patchFile(relativePath, replacements) {
  const filePath = path.join(__dirname, '..', relativePath);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-next] Successfully applied patch to ${relativePath}`);
  }
}

// 1. Patch app-page-turbo runtime to handle null React dispatcher gracefully during prerendering
patchFile('node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js', [
  ['t.use=function(e){return P.H.use(e)}', 't.use=function(e){return P.H?P.H.use(e):(e&&e._currentValue!==undefined?e._currentValue:e)}'],
  ['t.useContext=function(e){return P.H.useContext(e)}', 't.useContext=function(e){return P.H?P.H.useContext(e):(e&&e._currentValue!==undefined?e._currentValue:null)}']
]);

// 2. Patch layout-router in dist and esm
const layoutRouterTarget = `function OuterLayoutRouter({ parallelRouterKey, error, errorStyles, errorScripts, templateStyles, templateScripts, template, notFound, forbidden, unauthorized, segmentViewBoundaries }) {
    const context = (0, _react.useContext)(_approutercontextsharedruntime.LayoutRouterContext);
    if (!context) {
        throw new Error('invariant expected layout router to be mounted');
    }`;

const layoutRouterReplacement = `function OuterLayoutRouter({ parallelRouterKey, error, errorStyles, errorScripts, templateStyles, templateScripts, template, notFound, forbidden, unauthorized, segmentViewBoundaries }) {
    let context = null;
    try {
        context = (0, _react.useContext)(_approutercontextsharedruntime.LayoutRouterContext);
    } catch (_) {
        context = null;
    }
    if (!context) {
        return template || null;
    }`;

patchFile('node_modules/next/dist/client/components/layout-router.js', [
  [layoutRouterTarget, layoutRouterReplacement]
]);

const esmLayoutRouterTarget = `export default function OuterLayoutRouter({ parallelRouterKey, error, errorStyles, errorScripts, templateStyles, templateScripts, template, notFound, forbidden, unauthorized, segmentViewBoundaries }) {
    const context = useContext(LayoutRouterContext);
    if (!context) {
        throw new Error('invariant expected layout router to be mounted');
    }`;

const esmLayoutRouterReplacement = `export default function OuterLayoutRouter({ parallelRouterKey, error, errorStyles, errorScripts, templateStyles, templateScripts, template, notFound, forbidden, unauthorized, segmentViewBoundaries }) {
    let context = null;
    try {
        context = useContext(LayoutRouterContext);
    } catch (_) {
        context = null;
    }
    if (!context) {
        return template || null;
    }`;

patchFile('node_modules/next/dist/esm/client/components/layout-router.js', [
  [esmLayoutRouterTarget, esmLayoutRouterReplacement]
]);
