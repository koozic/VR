import { MessageCircleQuestion } from "lucide-react";
import { getConversationOptions } from "../curator/conversationOptions.js";

export default function CuratorConversationOptions({
  exhibit,
  disabled = false,
  onSelect,
}) {
  const options = getConversationOptions(exhibit);
  if (!options.length) return null;

  return (
    <section className="panel curator-options">
      <h3>
        <MessageCircleQuestion size={18} aria-hidden="true" />
        무엇이 궁금한가요?
      </h3>
      <div className="curator-options__list">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
