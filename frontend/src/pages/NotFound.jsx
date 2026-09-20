import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="access-denied-page">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Back to developer portal</Link>
    </div>
  );
}

export default NotFoundPage;
