import React from "react";
import * as Dialog from '@radix-ui/react-dialog'

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> =({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmButtonText = '確認',
    cancelButtonText = 'キャンセル',
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-lg bg-white p-6 shadow-xl data-[state=open]:animate-contentShow">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-700 text-base mb-6">
                        {description}
                    </Dialog.Description>
                    <div className="flex justify-end gap-3">
                        <Dialog.Close asChild>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                {confirmButtonText}
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            {cancelButtonText}
                        </button>
                    </div>
                    <Dialog.Close asChild>
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ConfirmDialog;