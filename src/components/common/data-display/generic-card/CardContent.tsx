/**
 * Card Content Component
 *
 * Renders the content sections of a GenericCard.
 * Each section can have an icon and content.
 */

import React from "react";
import type { CardSection } from "./types";

export interface CardContentProps {
  /** Array of content sections to display */
  sections: CardSection[];
}

export const CardContent: React.FC<CardContentProps> = ({ sections }) => {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`flex items-center text-sm text-gray-600 ${
            section.className || ""
          }`}
        >
          {section.icon && (
            <span className="mr-2 flex-shrink-0 text-gray-400">
              {section.icon}
            </span>
          )}
          <span className={section.icon ? "" : "w-full"}>
            {section.content}
          </span>
        </div>
      ))}
    </div>
  );
};
