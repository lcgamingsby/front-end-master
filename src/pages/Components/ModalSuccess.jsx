import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

const ModalSuccess = ({ isOpen, openModal, onClose, title, message, action }) => {
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
        className="fixed inset-0 bg-slate-500/75 transition-opacity data-[closed]:opacity-0
          data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out
          data-[leave]:ease-in"
        transition
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl
            transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300
            data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full
            sm:max-w-sm data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div
                className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full
                bg-emerald-200"
              >
                <FaCheck className={`h-6 w-6 text-emerald-600`} />
              </div>
              <div class="mt-4 text-center">
                <DialogTitle
                  as="h3"
                  class="text-base font-semibold leading-6 text-gray-900"
                >
                  {title !== null && title !== undefined ? title : "Success"}
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-600">
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
                class="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm
                font-semibold text-white shadow-xs hover:bg-violet-500"
                onClick={() => {
                  openModal(false);

                  if (onClose != null) {
                    onClose();
                  }
                }}
              >
                {action !== null && action !== undefined
                  ? action
                  : "OK"
                }
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default ModalSuccess;