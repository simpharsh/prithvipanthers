import React from 'react';
import './LoadingState.css';

const GALLERY_TILE_PATTERN = [
  'tile-xl',
  'tile-tall',
  'tile-wide',
  'tile-small',
  'tile-wide',
  'tile-small',
  'tile-tall',
  'tile-xl'
];

const GallerySkeleton = () => {
  return (
    <div className="gallery-grid loading-gallery-grid" aria-hidden="true">
      {GALLERY_TILE_PATTERN.map((tileClass, index) => (
        <div key={`skeleton-${tileClass}-${index}`} className={`gallery-item ${tileClass} loading-skeleton-card`}>
          <div className="loading-shimmer" />
        </div>
      ))}
    </div>
  );
};

export const InlineSpinner = ({ size = 'md', label = 'Loading' }) => {
  return (
    <span className={`inline-spinner inline-spinner-${size}`} role="status" aria-label={label}>
      <span className="inline-spinner-ring" />
    </span>
  );
};

const LoadingState = ({
  status,
  children,
  onRetry,
  errorTitle = 'Something went wrong',
  errorMessage = 'Unable to load this content right now.',
  skeleton = 'gallery',
  spinnerLabel = 'Loading content...'
}) => {
  if (status === 'loading') {
    return (
      <div className="loading-state-shell" aria-busy="true" aria-live="polite">
        <div className="loading-state-indicator">
          <InlineSpinner label={spinnerLabel} />
          <span className="loading-state-label">Loading</span>
        </div>
        {skeleton === 'gallery' ? <GallerySkeleton /> : null}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="loading-error-shell" role="alert">
        <p className="loading-error-title">{errorTitle}</p>
        <p className="loading-error-message">{errorMessage}</p>
        <button type="button" className="loading-retry-btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  return <div className="loading-success-shell">{children}</div>;
};

export default LoadingState;
