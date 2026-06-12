export const GALLERY_EMOTES = Object.freeze([
  { id: 'WAVE', label: '인사' },
  { id: 'CLAP', label: '박수' },
  { id: 'HEART', label: '하트' },
  { id: 'POINT', label: '가리키기' },
]);

const LABELS_BY_ID = new Map(GALLERY_EMOTES.map((emote) => [emote.id, emote.label]));

export function galleryEmoteLabel(emoteId) {
  return LABELS_BY_ID.get(emoteId) || '';
}
