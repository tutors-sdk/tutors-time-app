// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// Svelte 5 runes
	var $state: <T>(initial: T) => T;
	var $derived: <T>(fn: () => T) => T;
	var $effect: (fn: () => void | (() => void)) => void;
	var $props: <T>() => T;
}

export {};
