import { getExhibitConversationProfile } from "./exhibitConversationProfiles.js";

const optionGroups = {
  image: [
    {
      id: "creator",
      label: "작가를 중심으로 설명해 주세요",
      requires: ["creator"],
    },
    {
      id: "context",
      label: "시대적 배경이 궁금해요",
      available: hasHistoricalEvidence,
    },
    {
      id: "style",
      label: "표현 방식과 스타일을 알려 주세요",
      available: hasDescriptiveEvidence,
    },
    {
      id: "details",
      label: "눈여겨볼 부분을 짚어 주세요",
      requires: ["description"],
    },
  ],
  model: [
    {
      id: "purpose",
      label: "이 전시물의 역할을 알려 주세요",
      requires: ["description"],
    },
    {
      id: "history",
      label: "역사적 배경이 궁금해요",
      available: hasHistoricalEvidence,
    },
    {
      id: "details",
      label: "구조와 특징을 설명해 주세요",
      available: hasDescriptiveEvidence,
    },
  ],
  game: [
    {
      id: "how-to-play",
      label: "게임 방법을 알려 주세요",
      available: (exhibit) => exhibit.description?.includes("[조작법]"),
    },
    {
      id: "features",
      label: "대표적인 특징이 궁금해요",
      requires: ["description"],
    },
    {
      id: "creator",
      label: "제작자를 중심으로 소개해 주세요",
      requires: ["creator"],
    },
  ],
  youtube: [
    {
      id: "metadata",
      label: "등록된 영상 정보를 정리해 주세요",
      requires: ["description"],
    },
  ],
};

function hasHistoricalEvidence(exhibit) {
  return Boolean(
    exhibit.period
    || exhibit.year
    || exhibit.date
    || /\b(?:1[0-9]{3}|20[0-9]{2})년?\b/.test(exhibit.description || ""),
  );
}

function hasDescriptiveEvidence(exhibit) {
  return Boolean(
    exhibit.description
    || exhibit.material
    || exhibit.keywords?.length,
  );
}

function isAvailable(option, exhibit) {
  if (option.available && !option.available(exhibit)) return false;
  return (option.requires || []).every((field) => Boolean(exhibit[field]));
}

function createPrompt(option) {
  const focus = option.focus
    ? `특히 "${option.focus}"에 초점을 맞춰 주세요.`
    : "";
  return `${option.prompt || option.label} ${focus} 제공된 전시물 정보에 근거한 내용만 사용하고, 확인할 수 없는 내용은 추측하지 마세요.`;
}

export function getConversationOptions(exhibit) {
  if (!exhibit) return [];
  const profile =
    exhibit.curatorOptions
    || getExhibitConversationProfile(exhibit)
    || optionGroups[exhibit.type]
    || optionGroups.model;

  return profile
    .filter((option) => isAvailable(option, exhibit))
    .map((option) => ({
      id: option.id,
      label: option.label,
      prompt: createPrompt(option),
    }));
}
