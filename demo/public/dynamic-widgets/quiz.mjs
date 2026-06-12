const styles = `
.quiz {
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
.label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--rc-text-tertiary, #737373);
}
.question {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  appearance: none;
  text-align: left;
  border: 1px solid var(--rc-border, #e5e5e5);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 14px;
  padding: 10px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.option:hover {
  border-color: var(--rc-text-tertiary, #737373);
}
.option[data-state='correct'] {
  border-color: var(--rc-alert-tip, #11cc00);
  color: var(--rc-alert-tip, #11cc00);
  font-weight: 600;
}
.option[data-state='wrong'] {
  border-color: var(--rc-alert-caution, #cc0011);
  color: var(--rc-alert-caution, #cc0011);
}
.feedback {
  font-size: 13px;
  color: var(--rc-text-tertiary, #737373);
  min-height: 18px;
}
.reset {
  align-self: flex-start;
  appearance: none;
  border: none;
  background: none;
  color: var(--rc-text-tertiary, #737373);
  font-size: 12px;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}
`;

function createQuiz(container) {
  const style = document.createElement('style');
  style.textContent = styles;
  container.getRootNode().append(style);

  const el = document.createElement('div');
  el.className = 'quiz';
  container.append(el);

  let config = { question: '', options: [], answer: 0 };
  let answered = null;

  function render() {
    el.innerHTML = `
      <div class="label">Quick Check</div>
      <div class="question"></div>
      <div class="options"></div>
      <div class="feedback"></div>
    `;
    el.querySelector('.question').textContent = config.question;
    const optionsEl = el.querySelector('.options');
    const feedbackEl = el.querySelector('.feedback');

    config.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.type = 'button';
      btn.textContent = option;
      if (answered !== null) {
        if (index === config.answer) btn.dataset.state = 'correct';
        else if (index === answered) btn.dataset.state = 'wrong';
      }
      btn.addEventListener('click', () => {
        if (answered !== null) return;
        answered = index;
        render();
      });
      optionsEl.append(btn);
    });

    if (answered !== null) {
      feedbackEl.textContent =
        answered === config.answer ? 'Correct! 🎉' : 'Not quite — the highlighted one is right.';
      const reset = document.createElement('button');
      reset.className = 'reset';
      reset.type = 'button';
      reset.textContent = 'Try again';
      reset.addEventListener('click', () => {
        answered = null;
        render();
      });
      el.append(reset);
    }
  }

  let lastPropsJson = null;

  function apply(input) {
    const props = input.props ?? {};
    const propsJson = JSON.stringify(props);
    if (propsJson === lastPropsJson) return;
    lastPropsJson = propsJson;
    config = {
      question: typeof props.question === 'string' ? props.question : 'No question configured',
      options: Array.isArray(props.options) ? props.options.map(String) : [],
      answer: Number(props.answer) || 0,
    };
    answered = null;
    render();
  }

  return { apply, destroy: () => el.remove() };
}

export default {
  mount(container, input) {
    const quiz = createQuiz(container);
    quiz.apply(input);
    return {
      update(next) {
        quiz.apply(next);
      },
      unmount() {
        quiz.destroy();
      },
    };
  },
};
