import { CAL_COM_EMBED_URL, CAL_COM_URL } from "@/lib/book-a-call";

/** Inline Cal.com scheduler for the book-a-call page. */
export function CalEmbed() {
  return (
    <div className="pw-book-cal">
      <iframe
        src={CAL_COM_EMBED_URL}
        title="Book a call with PolicyWell"
        className="pw-book-cal-frame"
        loading="lazy"
        allow="camera; microphone; fullscreen; payment"
      />
      <p className="pw-book-cal-fallback">
        Calendar not loading?{" "}
        <a href={CAL_COM_URL} target="_blank" rel="noopener noreferrer">
          Open scheduling on Cal.com
        </a>
        .
      </p>
    </div>
  );
}
