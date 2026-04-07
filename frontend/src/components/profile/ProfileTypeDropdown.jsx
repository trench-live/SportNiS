import { useEffect, useRef, useState } from "react";
import { PROFILE_TYPE_OPTIONS } from "../../constants/profile";

export function ProfileTypeDropdown({ value, onChange, options = PROFILE_TYPE_OPTIONS }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="profile-type-dropdown" ref={rootRef}>
      <button
        className={open ? "profile-type-trigger open-dropdown" : "profile-type-trigger"}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption.label}</span>
        <span className="dropdown-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className="profile-type-menu">
          {options.map((option) => (
            <button
              key={option.value}
              className={option.value === value ? "profile-type-option active-option" : "profile-type-option"}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
