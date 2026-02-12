import React, { createContext, useContext, useState, ReactNode } from 'react';

type FeedbackType = 'interface_notes' | 'settings_notes' | 'bug_tech' | 'bug_mutashabihat' | 'suggestion' | 'other';

interface FeedbackContextType {
    isOpen: boolean;
    openFeedback: (type?: FeedbackType, contextDat?: any) => void;
    closeFeedback: () => void;
    initialType: FeedbackType;
    contextData: any;
    language: string;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode, language: string }> = ({ children, language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialType, setInitialType] = useState<FeedbackType>('interface_notes');
    const [contextData, setContextData] = useState<any>(null);

    const openFeedback = (type: FeedbackType = 'suggestion', data: any = null) => {
        setInitialType(type);
        setContextData(data);
        setIsOpen(true);
    };

    const closeFeedback = () => {
        setIsOpen(false);
        setContextData(null);
    };

    return (
        <FeedbackContext.Provider value={{ isOpen, openFeedback, closeFeedback, initialType, contextData, language }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (context === undefined) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
