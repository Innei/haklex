const styles = `
.widget {
  font-family: -apple-system, 'Inter', system-ui, sans-serif;
  border: 1px solid var(--rc-border, #e5e5e5);
  border-radius: 10px;
  padding: 20px;
  color: var(--rc-text, #171717);
  background: var(--rc-bg, #fff);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.count {
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 64px;
}
.btn {
  appearance: none;
  border: 1px solid var(--rc-border, #e5e5e5);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
}
.btn:hover {
  border-color: var(--rc-text-tertiary, #737373);
}
.meta {
  font-size: 12px;
  color: var(--rc-text-tertiary, #737373);
}
`;

function createWidget(container) {
  const style = document.createElement('style');
  style.textContent = styles;
  container.getRootNode().append(style);

  const el = document.createElement('div');
  el.className = 'widget';
  el.innerHTML = `
    <div class="title"></div>
    <div class="row">
      <button class="btn" data-op="dec" type="button">−</button>
      <span class="count">0</span>
      <button class="btn" data-op="inc" type="button">+</button>
    </div>
    <div class="meta"></div>
  `;
  container.append(el);

  let count = 0;
  let step = 1;
  let theme = 'light';
  let title = 'Counter';

  const countEl = el.querySelector('.count');
  const titleEl = el.querySelector('.title');
  const metaEl = el.querySelector('.meta');

  function render() {
    titleEl.textContent = title;
    countEl.textContent = String(count);
    metaEl.textContent = `step: ${step} · host theme: ${theme} ${theme === 'dark' ? '🌙' : '☀️'}`;
  }

  el.addEventListener('click', (event) => {
    const op = event.target?.dataset?.op;
    if (!op) return;
    count += op === 'inc' ? step : -step;
    render();
  });

  function apply(input) {
    step = Number(input.props.step) || 1;
    title = typeof input.props.title === 'string' ? input.props.title : 'Counter';
    theme = input.host.theme;
    render();
  }

  return { apply, destroy: () => el.remove() };
}

export default {
  mount(container, input) {
    const widget = createWidget(container);
    widget.apply(input);
    return {
      update(next) {
        widget.apply(next);
      },
      unmount() {
        widget.destroy();
      },
    };
  },
};
