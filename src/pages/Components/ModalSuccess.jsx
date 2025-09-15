import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

const ModalSuccess = ({ isOpen, openModal, onClose, title, message }) => {
    const close = () => {
        openModal(false);

        if (onClose != null) {
            onClose();
        }
    }

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
                            <div
                                className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full
                                bg-emerald-200 sm:mx-0 sm:size-10`}
                            >
                                <FaCheck className={`h-6 w-6 text-emerald-600`} />
                            </div>
                            <div class="mt-4 text-center">
                                <h3 class="text-base font-semibold leading-6 text-gray-900" id="dialog-title">
                                    {title !== null && title !== undefined ? title : "Success"}
                                </h3>
                                <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    {message !== null && message !== undefined
                                        ? message
                                        : "The operation was completed successfully."
                                    }
                                </p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white px-4 py-3 sm:px-6">
                            <button
                                type="button"
                                class={`inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm
                                font-semibold text-white shadow-xs hover:bg-violet-500 sm:ml-3 sm:w-auto`}
                                onClick={close}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalSuccess;