/// <reference path="../.astro/types.d.ts" />

interface Window {
  __theme: string;
  __onThemeChange: { (newTheme: string): void };
  __setPreferredTheme: { (newTheme: string): void };
}
