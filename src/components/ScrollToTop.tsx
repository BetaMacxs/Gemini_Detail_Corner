import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash (e.g., #reviews), don't scroll to top so the browser can jump to the anchor
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Otherwise, scroll to top of window
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
