import React from 'react';

// styles
import styles from './styles.module.scss';

const Mouse = (): JSX.Element => {
    const ref = React.useRef<HTMLDivElement>(null);

    const handleOnMouseMove = (e: MouseEvent): void => {
        if (ref.current) {
            ref.current.style.top = `${e.clientY}px`;
            ref.current.style.left = `${e.clientX}px`;
        }
    };

    const handleOnMouseLeave = (): void => {
        if (ref.current) {
            ref.current.style.display = 'none';
        }
    };

    const handleOnMouseEnter = (): void => {
        if (ref.current && ref.current.style.display !== 'block') {
            ref.current.style.display = 'block';
        }
    };

    React.useEffect(() => {
        window.addEventListener('mousemove', handleOnMouseMove);
        window.addEventListener('mouseout', handleOnMouseLeave);
        window.addEventListener('mouseover', handleOnMouseEnter);
    }, []);

    return (
        <div className={styles.container} ref={ref} />
    );
};

export default Mouse;