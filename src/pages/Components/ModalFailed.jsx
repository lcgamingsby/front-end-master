import React, { useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { FaExclamationTriangle } from "react-icons/fa";

const ModalFailed = ({ isOpen, openModal, onClose, title, message, closeText }) => {
    const close = () => {
        openModal(false);

        if (onClose != null) {
            onClose();
        }
    }

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                openModal(false);

                if (onClose != null) {
                    onClose();
                }
            }}
            className="relative z-10"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-800/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 flex flex-col items-center justify-center">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0">
                                <FaExclamationTriangle className={`h-6 w-6 sm:h-8 sm:w-8 text-red-600`} />
                            </div>
                            <div class="mt-4 text-center">
                                <DialogTitle
                                    as="h3"
                                    className="text-base font-semibold leading-6 text-gray-900"
                                >
                                    {title != null ? title : "Failed"}
                                </DialogTitle>
                                <div class="mt-2">
                                <p class="text-sm text-gray-600">
                                    {message !== null && message !== undefined
                                        ? message
                                        : "The operation failed."
                                    }
                                </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-3 sm:px-6">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2
                                text-sm font-semibold text-white shadow-sm hover:bg-red-500 cursor-pointer"
                                onClick={close}
                            >
                                {(closeText !== null && closeText !== undefined) ? closeText : "OK"}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default ModalFailed;