import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const ModalConfirmDelete = ({ isOpen, openModal, onTrue, onFalse, title, message}) => {
    const close = () => {
        openModal(false);

        if (onFalse != null) {
            onFalse();
        }
    }

    let open = isOpen;

    return (
        <div className="relative z-10" aria-labelledby="dialog-title" role="dialog" aria-modal="true">
            <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
                onClick={close}
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl
                        transition-all sm:my-8 sm:w-full sm:max-w-lg"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div
                                    className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full
                                    bg-red-200 sm:mx-0 sm:size-10`}
                                >
                                    <FaExclamationTriangle
                                        className={`h-6 w-6 text-red-600`}
                                    />
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 class="text-base font-semibold text-gray-900" id="dialog-title">{title}</h3>
                                    <div class="mt-2">
                                    <p class="text-sm text-gray-500">{message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                type="button"
                                class={`inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm
                                font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto`}
                                onClick={() => {
                                    if (onTrue != null) {
                                        onTrue();
                                    }
                                }}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm
                                font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset
                                hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                onClick={close}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalConfirmDelete;