import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
                                                         children,
                                                         className = "",
                                                         title,
                                                         description
                                                     }) => {
    return (
        <div className={`w-full space-y-6 ${className}`}>
            {(title || description) && (
                <div className="space-y-2">
                    {title && (
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    )}
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export default PageContainer; 