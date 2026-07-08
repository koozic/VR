import { useMemo, useState } from 'react';
import { ArrowRight, Check, UserRound } from 'lucide-react';
import CharacterPreview from './components/CharacterPreview.jsx';
import CharacterThumbnail from './components/CharacterThumbnail.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import { CuratorSessionProvider } from './curator/CuratorSessionContext.jsx';
import { assetUrl } from './three/assetUrl.js';

const MAX_NICKNAME_LENGTH = 20;
const CHARACTER_OPTIONS = Array.from({ length: 18 }, (_, index) => {
  const letter = String.fromCharCode(97 + index);
  return {
    id: `character-${letter}`,
    label: `Type ${letter.toUpperCase()}`,
    textureUrl: assetUrl(`assets/blocky-characters/Textures/texture-${letter}.png`),
  };
});

function normalizeNickname(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, MAX_NICKNAME_LENGTH);
}

function EntryGate({ onEnter }) {
  const [nickname, setNickname] = useState('');
  const [characterId, setCharacterId] = useState(CHARACTER_OPTIONS[0].id);
  const normalizedNickname = useMemo(() => normalizeNickname(nickname), [nickname]);
  const canEnter = normalizedNickname.length > 0 && Boolean(characterId);

  const submitProfile = (event) => {
    event.preventDefault();
    if (!canEnter) return;

    onEnter({
      nickname: normalizedNickname,
      characterId,
    });
  };

  return (
    <main className="entry-page">
      <section className="entry-panel" aria-labelledby="entry-title">
        <div className="entry-panel__header">
          <span className="entry-panel__eyebrow">LIVE GALLERY</span>
          <h1 id="entry-title">VR 전시회 입장</h1>
          <p>전시관에서 표시될 닉네임과 캐릭터를 선택하세요.</p>
          <CharacterPreview characterId={characterId} />
        </div>

        <form className="entry-form" onSubmit={submitProfile}>
          <label className="entry-field">
            <span>
              <UserRound size={17} aria-hidden="true" />
              닉네임
            </span>
            <input
              value={nickname}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="닉네임 입력"
              autoFocus
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>

          <fieldset className="character-picker">
            <legend>캐릭터 선택</legend>
            <div className="character-picker__grid">
              {CHARACTER_OPTIONS.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  className={
                    character.id === characterId
                      ? 'character-option character-option--selected'
                      : 'character-option'
                  }
                  aria-pressed={character.id === characterId}
                  onClick={() => setCharacterId(character.id)}
                >
                  <span className="character-option__preview">
                    <CharacterThumbnail
                      characterId={character.id}
                      fallbackSrc={character.textureUrl}
                    />
                  </span>
                  <span className="character-option__label">{character.label}</span>
                  {character.id === characterId && (
                    <Check className="character-option__check" size={15} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="entry-submit" type="submit" disabled={!canEnter}>
            입장하기
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [visitorProfile, setVisitorProfile] = useState(null);

  if (!visitorProfile) {
    return <EntryGate onEnter={setVisitorProfile} />;
  }

  return (
    <CuratorSessionProvider>
      <GalleryPage visitorProfile={visitorProfile} />
    </CuratorSessionProvider>
  );
}
