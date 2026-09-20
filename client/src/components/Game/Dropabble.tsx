import { useDroppable } from '@dnd-kit/react';
import type React from 'react';

interface DropabbleProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string;
}

const Dropabble: React.FC<DropabbleProps> = ({ id, children, ...props }) => {
    const { ref } = useDroppable({
        id,
    });

    return (
        <div ref={ref} {...props}>
            {children}
        </div>
    );
};

export default Dropabble;
