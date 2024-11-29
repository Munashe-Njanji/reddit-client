import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  // Create a state to store whether the media query matches
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a MediaQueryList object by passing the query to matchMedia
    const mediaQuery = window.matchMedia(query);

    // Initial check of media query state
    setMatches(mediaQuery.matches);

    // Event handler to update state when media query changes
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // Add event listener for media query changes
    // 'change' is the standard event for media query state changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query, setMatches]); // Re-run effect if query changes

  return matches;
}
