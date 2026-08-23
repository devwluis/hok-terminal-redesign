/**
 * HOK shell stacking contract.
 *
 * Keep the instrument's layers predictable: the tty surface is the foundation,
 * tabs and app chrome sit above it, and recovery / safety messaging always wins.
 */
export const SHELL_LAYERS = {
  terminalContent: 10,
  terminalTabs: 20,
  dock: 30,
  keysBarMinimized: 40,
  keysBarExpanded: 50,
  recoveryOverlay: 60,
} as const;

export type ShellLayer = keyof typeof SHELL_LAYERS;