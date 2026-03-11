import { Transition } from "@headlessui/react";
import { useEffect } from "react";
import { FaXmark } from "react-icons/fa6";

const Snackbar = ({
  isOpen,
  setOpen,
  duration,
  animDuration,
  text,
  className,
  buttonClassName,
}) => {
  useEffect(() => {
    if (typeof duration === "number" && isOpen) {
      const timeoutId = setTimeout(() => {
        setOpen(false);
      }, duration);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  return (
    <Transition show={isOpen}>
      <div
        className={`fixed bottom-0 left-0 z-8 px-3 py-2 w-full flex justify-between gap-2
          transition duration-${animDuration || '300'} ease-in-out data-closed:translate-y-full
          ${className || ''}
        `}
      >
        <p className="grow text-justify">
          { text }
        </p>

        { (setOpen !== null && typeof setOpen === 'function') && (
          <button
            className={`grow-0 min-w-6 min-h-6 w-6 h-6 grid grid-cols-1 justify-center items-center
              cursor-pointer rounded-lg ${buttonClassName || ''}`}
            title="Dismiss"
            onClick={() => setOpen(false)}
          >
            <FaXmark className="w-5 h-5 m-0.5 text-current" />
          </button>
        ) }
      </div>
    </Transition>
  )
}

export default Snackbar;