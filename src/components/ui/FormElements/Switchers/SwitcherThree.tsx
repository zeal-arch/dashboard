import { CheckIconSmall, CrossIconSmall } from "@/admin/assets/icons";
import { useState } from "react";

const SwitcherThree = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div>
      <label
        htmlFor="toggle3"
        className="flex cursor-pointer select-none items-center"
      >
        <span className="sr-only">Toggle switch</span>
        <div className="relative">
          <input
            type="checkbox"
            id="toggle3"
            className="sr-only"
            onChange={() => {
              setEnabled(!enabled);
            }}
          />
          <div className="block h-8 w-14 rounded-full bg-gray-3 dark:bg-[#5A616B]"></div>
          <div
            className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-switch-1 transition ${
              enabled && "right-1! translate-x-full! bg-primary! dark:bg-white!"
            }`}
          >
            <span className={`hidden ${enabled && "!block"}`}>
              <CheckIconSmall className="fill-white dark:fill-dark" />
            </span>
            <span className={`${enabled && "hidden"}`}>
              <CrossIconSmall className="fill-current" />
            </span>
          </div>
        </div>
      </label>
    </div>
  );
};

export default SwitcherThree;
