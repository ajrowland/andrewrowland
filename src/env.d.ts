/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  __theme: string;
  __onThemeChange: { (newTheme: string): void };
  __setPreferredTheme: { (newTheme: string): void };
}
