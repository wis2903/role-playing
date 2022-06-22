import React from 'react';
import { actionAnimations } from '../../../resources/characters';

import styles from './styles.module.scss';

interface IActionItem {
    key: string,
    name: string,
}

interface IActionsMenuProps {
    onSelect: (action: IActionItem) => void,
}

const ActionsMenu = ({ onSelect }: IActionsMenuProps): JSX.Element => {
    return (
        <div className={styles.container}>
            {
                actionAnimations.map(item =>
                    <button key={item.key} onClick={(): void => {
                        onSelect(item);
                    }}>{item.name}</button>
                )
            }
        </div>
    );
};

export default ActionsMenu;