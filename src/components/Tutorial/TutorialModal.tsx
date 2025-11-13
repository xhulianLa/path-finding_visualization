import React from "react";
import "./TutorialModal.css";
import { TutorialPage } from "../../tutorialPages";


interface TutorialModalProps {
  pages: TutorialPage[];
  currentIndex: number;
  visible: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  heading?: string;
}

const TutorialModal: React.FC<TutorialModalProps> = ({
  pages,
  currentIndex,
  visible,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  heading = "Quick Tutorial"
}) => {
  if (!visible || pages.length === 0) return null;

  const totalPages = pages.length;
  const safeIndex = Math.min(Math.max(currentIndex, 0), totalPages - 1);
  const page = pages[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === totalPages - 1;

  return (
    <div
      className="tutorial-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-heading"
    >
      <div className="tutorial-card">
        <div className="tutorial-card__header">
          <div>
            <p className="tutorial-card__eyebrow">{heading}</p>
            <h2 id="tutorial-heading">{page.title}</h2>
          </div>
          <span className="tutorial-card__counter">
            {safeIndex + 1}/{totalPages}
          </span>
        </div>

        {page.media && (
          <div className="tutorial-card__media">
            {page.media.type === "video" ? (
              <video
                src={page.media.src}
                autoPlay
                loop
                muted
                playsInline
                aria-label={page.media.alt}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={page.media.src} alt={page.media.alt ?? ""} />
            )}
          </div>
        )}

        <div className="tutorial-card__body">{page.description}</div>

        <div className="tutorial-card__footer">
          <button
            type="button"
            className="tutorial-btn tutorial-btn--ghost"
            onClick={onSkip}
          >
            Skip
          </button>
          <div
            className="tutorial-card__dots"
            aria-label={`Page ${safeIndex + 1} of ${totalPages}`}
          >
            {pages.map((_, idx) => (
              <span
                key={`tutorial-dot-${idx}`}
                className={`tutorial-card__dot${idx === safeIndex ? " tutorial-card__dot--active" : ""
                  }`}
              />
            ))}
          </div>
          <div className="tutorial-card__actions">
            <button
              type="button"
              className="tutorial-btn"
              onClick={onPrev}
              disabled={isFirst}
            >
              Previous
            </button>
            <button
              type="button"
              className="tutorial-btn tutorial-btn--primary"
              onClick={isLast ? onFinish : onNext}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
