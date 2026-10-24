interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}

export default ErrorMessage;