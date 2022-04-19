import React from 'react';

type Props = {
  error: any;
  resetErrorBoundary: () => void;
};

function SimpleErrorBoundary({ error, resetErrorBoundary }: Props) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary} type="button">
        Try again
      </button>
    </div>
  );
}

export default SimpleErrorBoundary;
