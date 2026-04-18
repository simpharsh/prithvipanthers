import React, { useEffect, useState } from 'react';
import { InlineSpinner } from './LoadingState';
import './LoadingState.css';

const ProgressiveImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) setHasError(true);
      else setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`progressive-image-shell ${containerClassName} ${isLoaded ? 'is-loaded' : ''} ${hasError ? 'is-error' : ''}`}>
      {!isLoaded && !hasError ? (
        <>
          <div className="progressive-image-placeholder loading-shimmer" aria-hidden="true" />
          <div className="progressive-image-spinner">
            <InlineSpinner size="sm" label="Loading image" />
          </div>
        </>
      ) : null}

      {hasError ? (
        <div className="progressive-image-error" role="img" aria-label="Image unavailable">
          Image unavailable
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          className={className}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
