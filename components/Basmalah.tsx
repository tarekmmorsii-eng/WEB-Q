import React from 'react';

interface BasmalahProps {
    className?: string;
    fontSize?: 'small' | 'medium' | 'large';
}

const Basmalah: React.FC<BasmalahProps> = ({ className, fontSize = 'medium' }) => {
    return (
        <div className={`text-center ${className} flex items-center justify-center`} style={{ fontFamily: 'Amiri' }}>
            <span className={`quran-text-${fontSize} leading-tight block pt-2 text-center w-full`}>
                ﷽
            </span>
        </div>
    );
};

export default Basmalah;
