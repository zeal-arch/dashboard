import { CrossIconSmall } from "@/admin/assets/icons";
import { useState } from "react";

const CheckboxThree = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <div>
      <label
        htmlFor="checkboxLabelThree"
        className="flex cursor-pointer select-none items-center text-body-sm font-medium"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="checkboxLabelThree"
            className="sr-only"
            onChange={() => {
              setIsChecked(!isChecked);
            }}
          />
          <div
            className={`box mr-2 flex h-5 w-5 items-center justify-center rounded border ${
              isChecked
                ? "border-primary bg-gray-2 dark:bg-transparent"
                : "border-dark-5 dark:border-dark-6"
            }`}
          >
            <span
              className={`text-primary opacity-0 ${
                isChecked && "!opacity-100"
              }`}
            >
              <CrossIconSmall className="fill-current" />
            </span>
          </div>
        </div>
        Checkbox Text
      </label>
    </div>
  );
};

export default CheckboxThree;
