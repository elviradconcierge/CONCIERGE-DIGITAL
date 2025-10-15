/**
 * useTabNavigation Hook
 *
 * Manages tab navigation state and changes
 */

import { useState, useEffect } from "react";
import type { NavigationTab } from "../components/shared";

interface UseTabNavigationProps {
  onLogout: () => void;
}

interface UseTabNavigationReturn {
  activeTab: NavigationTab;
  handleTabChange: (tab: NavigationTab) => void;
}

export const useTabNavigation = ({
  onLogout,
}: UseTabNavigationProps): UseTabNavigationReturn => {
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");

  // Log when activeTab changes
  useEffect(() => {
    console.log(`🎯 [useTabNavigation] activeTab changed to: ${activeTab}`);
  }, [activeTab]);

  const handleTabChange = (tab: NavigationTab) => {
    console.log(`📱 [useTabNavigation] Tab change requested: ${tab}`);

    if (tab === "logout") {
      console.log(`🚪 [useTabNavigation] Logout tab clicked`);
      onLogout();
      return;
    }

    console.log(`📱 [useTabNavigation] Setting activeTab to: ${tab}`);
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
};
