import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Replace the old useEffect with this one:
useEffect(() => {
  // This scrolls the main window
  window.scrollTo(0, 0);

  // This finds your scrollable content area and forces it to the top
  const mainContent = document.querySelector('.overflow-y-auto');
  if (mainContent) {
    mainContent.scrollTo(0, 0);
  }
}, [pathname]);

  return null;
};

export default ScrollToTop;