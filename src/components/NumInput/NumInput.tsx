import TextField from "@mui/material/TextField";
import { NumericFormat } from "react-number-format";
import { useState } from "react";

interface NumInputProps {
  inputMode: "decimal" | "integer";
  decimalSymbol: string;
  thousandsSymbol: string;
  minValue: number;
  maxValue: number;
  value: number;
  onChange: () => void;
}

export const NumInput = ({
  decimalSymbol = ",",
  thousandsSymbol = ".",
  ...props
}: NumInputProps) => {
  const [ErrorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <NumericFormat
      error={ErrorMessage !== null}
      helperText={ErrorMessage ? ErrorMessage : ""}
      customInput={TextField}
      type="text"
      thousandsGroupStyle="thousand"
      thousandSeparator={thousandsSymbol}
      decimalSeparator={decimalSymbol}
      onChange={props.onChange}
      value={props.value}
      isAllowed={(values: any) => {
        const { value } = values;
        //providing entry-based feedback
        if (!props.inputMode) {
          setErrorMessage("select decimal or integer");
          return false;
        }
        if (props.inputMode) {
          setErrorMessage(null);
        }
        if (props.inputMode === "integer" && value % 1 != 0) {
          setErrorMessage("fractional part is not allowed in integer mode");
          return false;
        }
        if (props.minValue && value < props.minValue) {
          setErrorMessage("please enter a value superior than minValue");
        }
        if (props.maxValue && value > props.maxValue) {
          setErrorMessage("value must be inferior than maxValue");
        }
        return true;
      }}
    />
  );
};
