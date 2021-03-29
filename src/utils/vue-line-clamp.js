// Credit to https://github.com/AndyDyer/vue-line-clamp/tree/add-options-change-fallback-logic
const currentValueProp = 'vLineClampValue';

function defaultFallbackFunc (el, bindings, vNode) {
  const lines = parseInt(bindings.value);
  if (lines) {
    let lineHeight = parseInt(bindings.arg);
    if (isNaN(lineHeight)) {
      console.warn(
        'line-height argument for vue-line-clamp must be a number (of pixels), falling back to 16px'
      );
      lineHeight = 16;
    }

    const maxHeight = lineHeight * lines;

    el.style.maxHeight = maxHeight ? maxHeight + 'px' : '';
    el.style.overflowX = 'hidden';
    el.style.lineHeight = lineHeight + 'px'; // to ensure consistency
  } else {
    el.style.maxHeight = el.style.overflowX = '';
  }
  if (el.scrollHeight > el.offsetHeight) vNode.context.$data.textTruncated = true;
}

const truncateText = function (el, bindings, vNode) {
  const lines = parseInt(bindings.value);
  if (isNaN(lines)) {
    console.error('Parameter for vue-line-clamp must be a number');
    return;
  } else if (lines !== el[currentValueProp]) {
    el[currentValueProp] = lines;
    el.style.webkitLineClamp = lines || '';
  }
  if (el.scrollHeight > el.offsetHeight) vNode.context.$data.textTruncated = true;
};

const VueLineClamp = {
  install (Vue, options) {
    options = Object.assign(
      { importCss: false, textOverflow: 'ellipsis', wordBreak: 'break-word' },
      options
    );

    const styles = `
      display: block;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: ${options.wordBreak};
      text-overflow: ${options.textOverflow};
    `;

    if (options.importCss) {
      const stylesheets = window.document.styleSheets;
      const rule = `.vue-line-clamp{${styles}}`;
      if (stylesheets && stylesheets[0] && stylesheets.insertRule) {
        stylesheets.insertRule(rule);
      } else {
        const link = window.document.createElement('style');
        link.id = 'vue-line-clamp';
        link.appendChild(window.document.createTextNode(rule));
        window.document.head.appendChild(link);
      }
    }

    const clampFunction =
      'webkitLineClamp' in document.body.style
        ? truncateText
        : options.fallbackFunc || defaultFallbackFunc;

    Vue.directive('line-clamp', {
      currentValue: 0,
      bind (el) {
        if (!options.importCss) {
          el.style.cssText += styles;
        } else {
          el.classList.add('vue-line-clamp');
        }
      },
      inserted: (el, bindings, vNode) => clampFunction(el, bindings, vNode),
      updated: (el, bindings, vNode) => clampFunction(el, bindings, vNode),
      componentUpdated: (el, bindings, vNode) =>
        clampFunction(el, bindings, vNode)
    });
  }
};

export default VueLineClamp;
