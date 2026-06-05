import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export function createGamePanel(game) {
  const wrapper = document.createElement('div');
  wrapper.className = 'game-panel';

  const inner = document.createElement('div');
  inner.className = 'game-panel__inner';

  const screen = document.createElement('div');
  screen.className = 'game-panel__screen';

  const title = document.createElement('div');
  title.className = 'game-panel__title';
  title.textContent = game.title;

  const subtitle = document.createElement('div');
  subtitle.className = 'game-panel__subtitle';
  subtitle.textContent = `${game.creator || ''}${game.year ? ' · ' + game.year : ''}`;

  const hint = document.createElement('div');
  hint.className = 'game-panel__hint';
  hint.textContent = '🕹️ 새 창에서 플레이';

  screen.append(title, subtitle, hint);
  inner.appendChild(screen);
  wrapper.appendChild(inner);

  const panel = new CSS3DObject(wrapper);
  panel.scale.setScalar(0.006);
  panel.userData.gameUrl = game.gameUrl;

  return panel;
}
