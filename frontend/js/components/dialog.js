import { handleDeleteHistory } from "./history.js";

export function setupDialog(message, action, id = null) {
    const dialogYesAction = document.getElementById('confirm-yes');
    const dialogMessage = document.getElementById('confirm-message');

    if (!dialogYesAction || !dialogMessage) {
        throw new Error('dialogYesAction or dialogMessage not found');
    }

    dialogMessage.textContent = message;

    dialogYesAction.dataset.action = action;

    if ((action === 'delete-history') && (id !== null)) {
        dialogYesAction.dataset.id = id;
    }
}

export function handleDialog() {
    const dialogYesAction = document.getElementById('confirm-yes');

    if (!dialogYesAction) {
        throw new Error('dialogYesAction not found');
    }

    dialogYesAction.addEventListener('click', async () => {
        const action = dialogYesAction.dataset.action;

        if (!action) {
            throw new Error('data-action of dialogYesAction not found');
        }

        switch (action) {
            case 'delete-all-history':
                await handleDeleteHistory('all');
                break;

            case 'delete-history':
                const id = dialogYesAction.dataset.id;

                if (!id) {
                    throw new Error('data-id of dialogYesAction not found');
                }

                await handleDeleteHistory(id);

                break;
            
            default:
                throw new Error('Invalid data-action of dialogYesAction');
        }
    });
}