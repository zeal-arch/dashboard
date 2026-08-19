import { CheckIconBlue } from "@/admin/assets/icons";
import { useState } from "react";

const CheckboxTwo = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <div>
      <label
        htmlFor="checkboxLabelTwo"
        className="flex cursor-pointer select-none items-center text-body-sm font-medium"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="checkboxLabelTwo"
            className="sr-only"
            onChange={() => {
              setIsChecked(!isChecked);
            }}
          />
          <div
            className={`mr-2 flex h-5 w-5 items-center justify-center rounded border ${
              isChecked
                ? "border-primary bg-gray-2 dark:bg-transparent"
                : "border border-dark-5 dark:border-dark-6"
            }`}
          >
            <span className={`opacity-0 ${isChecked && "opacity-100!"}`}>
              <CheckIconBlue />
            </span>
          </div>
        </div>
        Checkbox Text
      </label>
    </div>
  );
};

export default CheckboxTwo;
