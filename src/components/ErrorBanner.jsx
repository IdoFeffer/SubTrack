import "./ErrorBanner.css";

export default function ErrorBanner({ onRetry }) {
  return (
    <div className="error-banner">
      <p className="error-banner__text">לא הצלחנו לטעון את המנויים</p>
      <button onClick={onRetry} className="error-banner__retry">
        נסה שוב
      </button>
    </div>
  );
}
