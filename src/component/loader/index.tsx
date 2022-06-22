import React from 'react';

// styles
import styles from './styles.module.scss';

const Loader = ({ message }: { message?: string }): JSX.Element => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <span />
                <span />
                <span />
            </div>
            <div className={styles.message}>{message}</div>
        </div>
    );
};

export default Loader;