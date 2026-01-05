'use client';

import { useState, useEffect } from 'react';

interface IBeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function useInstallPrompt() {
    const [promptEvent, setPromptEvent] = useState<IBeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            console.log('👋 PWA Install Prompt captured!');
            setPromptEvent(e as IBeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            console.log('🎉 PWA Installed successfully!');
            setIsAppInstalled(true);
            setPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if valid PWA is already installed (basic check for standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptToInstall = async () => {
        if (!promptEvent) {
            console.warn('Install prompt not available');
            return;
        }

        // Show the install prompt
        await promptEvent.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await promptEvent.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // We've used the prompt, so clear it
        setPromptEvent(null);
    };

    return {
        showInstallPrompt: !!promptEvent && !isAppInstalled,
        promptToInstall,
        isAppInstalled
    };
}
