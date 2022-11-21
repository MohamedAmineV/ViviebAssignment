import TextField from "@mui/material/TextField";
import { useRef, useState } from "react";

interface NumInputProps {
  inputMode: "decimal" | "integer";
  decimalSymbol: string;
  thousandsSymbol: string;
  minValue: number;
  maxValue: number;
}

const formatThousands = (val: string, thousandsSymbol: string) => {
  let chunks = [];
  for (let i = val.length - 1; i >= 0; i -= 3) {
    chunks.push(val.substring(i - 2, i + 1));
  }
  return chunks.reverse().join(thousandsSymbol);
};

const transcodeNumber = (
  val: string,
  decimalSymbol: string,
  thousandSymbol: string
) => {
  let replacing_thousandsRemoved = val.replaceAll(thousandSymbol, "");
  return replacing_thousandsRemoved.replace(decimalSymbol, ".");
};

const formatNumber = (
  val: string,
  decimalSymbol: string,
  thousandSymbol: string
) => {
  //reformatting according to provided symbols.  ;
  let transcodedNumber = transcodeNumber(val, decimalSymbol, thousandSymbol);
  let separatorIndex = transcodedNumber.indexOf(".");
  if (separatorIndex === -1) {
    return formatThousands(transcodedNumber, thousandSymbol);
  } else {
    let decimalPart = transcodedNumber.substring(0, separatorIndex);
    let fractionalPart = transcodedNumber.substring(separatorIndex + 1);
    return (
      formatThousands(decimalPart, thousandSymbol) +
      decimalSymbol +
      fractionalPart
    );
  }
};

const isNumeric = (val: string) => {
  return /^-?\d+$/.test(val);
};

const getDiffChar = (a: string, b: string) => {
  let i = 0;
  if (a.length > b.length) {
    [a, b] = [b, a];
  }
  if (a === "") {
    return b;
  }
  while (i < a.length && a[i] === b[i]) {
    i++;
  }
  return b[i];
};

//main Component
export const NumInput = ({
  decimalSymbol = ",",
  thousandsSymbol = ".",
  ...props
}: NumInputProps) => {
  const [ErrorMessage, setErrorMessage] = useState<string | null>(null);
  const [Value, setValue] = useState("");
  const OldThousandsSymbol = useRef(thousandsSymbol);
  const OldDecimalSymbol = useRef(decimalSymbol);
  const inputRef = useRef();

  const handleInputInRange = (val: string) => {
    let number = parseFloat(val);
    if (props.minValue && number < props.minValue) {
      setErrorMessage("please enter a value superior than minValue");
    } else if (props.maxValue && number > props.maxValue) {
      setErrorMessage("value must be inferior than maxValue");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let submittedValue = event.target.value;
    let prevValue = Value;

    //"integer" or "decimal" must be selected
    if (!props.inputMode) {
      setErrorMessage("select decimal or integer");
      return;
    }

    //no value in input
    if (submittedValue === "") {
      setValue("");
      return;
    }

    //resetting error message
    setErrorMessage(null);

    //detecting changes in "thousands" and "decimal" symbols
    if (thousandsSymbol !== OldThousandsSymbol.current) {
      if (thousandsSymbol === decimalSymbol) {
        setErrorMessage("select another thousandsSymbol");
        return;
      } else {
        submittedValue = submittedValue.replaceAll(
          OldThousandsSymbol.current,
          thousandsSymbol
        );
        prevValue = Value.replaceAll(
          OldThousandsSymbol.current,
          thousandsSymbol
        );
        OldThousandsSymbol.current = thousandsSymbol;
      }
    }

    if (decimalSymbol !== OldDecimalSymbol.current) {
      if (decimalSymbol === thousandsSymbol) {
        setErrorMessage("select another decimal symbol");
        return;
      } else {
        submittedValue = submittedValue.replaceAll(
          OldDecimalSymbol.current,
          decimalSymbol
        );
        prevValue = Value.replaceAll(OldDecimalSymbol.current, decimalSymbol);
        OldDecimalSymbol.current = decimalSymbol;
      }
    }

    //computing input value change
    let diffChar = getDiffChar(prevValue, submittedValue);
    let lastCursorPostion = (inputRef.current as any).selectionStart;
    if (
      diffChar === decimalSymbol ||
      isNumeric(diffChar) ||
      (diffChar === thousandsSymbol && prevValue.length > submittedValue.length)
    ) {
      if (diffChar === decimalSymbol) {
        if (
          (props.inputMode === "decimal" &&
            (prevValue.indexOf(decimalSymbol) === -1 ||
              submittedValue.indexOf(decimalSymbol) === -1)) ||
          (props.inputMode === "integer" &&
            submittedValue.indexOf(decimalSymbol) === -1)
        ) {
          let newValue = formatNumber(
            submittedValue,
            decimalSymbol,
            thousandsSymbol
          );

          Promise.resolve()
            .then(() => {
              setValue(newValue);
            })
            .then(() => {
              handleInputInRange(
                transcodeNumber(newValue, decimalSymbol, thousandsSymbol)
              );
            })
            .then(() => {
              //adjusting cursor position
              if (prevValue.indexOf(decimalSymbol) === -1) {
                let newCursorPosition =
                  (newValue.indexOf(decimalSymbol) as number) + 1;
                event.target.setSelectionRange(
                  newCursorPosition,
                  newCursorPosition
                );
              } else {
                let decimalRest =
                  transcodeNumber(
                    prevValue,
                    decimalSymbol,
                    thousandsSymbol
                  ).substring(
                    0,
                    transcodeNumber(
                      prevValue,
                      decimalSymbol,
                      thousandsSymbol
                    ).indexOf(".")
                  ).length % 3;
                let fractionalRest =
                  transcodeNumber(
                    prevValue,
                    decimalSymbol,
                    thousandsSymbol
                  ).substring(
                    transcodeNumber(
                      prevValue,
                      decimalSymbol,
                      thousandsSymbol
                    ).indexOf(".") + 1
                  ).length % 3;
                if (
                  (decimalRest === 0 &&
                    (fractionalRest === 1 || fractionalRest === 2)) ||
                  (decimalRest === 2 && fractionalRest === 2)
                ) {
                  event.target.setSelectionRange(
                    lastCursorPostion + 1,
                    lastCursorPostion + 1
                  );
                } else {
                  event.target.setSelectionRange(
                    lastCursorPostion,
                    lastCursorPostion
                  );
                }
              }
            });

          return;
        } else {
          Promise.resolve()
            .then(() => {
              setErrorMessage("decimalSymbol Not allowed");
            })
            .then(() => {
              event.target.setSelectionRange(
                lastCursorPostion - 1,
                lastCursorPostion - 1
              );
            });

          return;
        }
      } else {
        submittedValue =
          submittedValue.indexOf(decimalSymbol) !== -1 &&
          props.inputMode === "integer"
            ? submittedValue.replace(decimalSymbol, "")
            : submittedValue;
        let newValue = formatNumber(
          diffChar === thousandsSymbol
            ? prevValue.replace(prevValue[lastCursorPostion - 1], "")
            : submittedValue,
          decimalSymbol,
          thousandsSymbol
        );

        Promise.resolve()
          .then(() => {
            setValue(newValue);
          })
          .then(() => {
            handleInputInRange(
              transcodeNumber(newValue, decimalSymbol, thousandsSymbol)
            );
          })
          .then(() => {
            if (
              props.inputMode === "decimal" &&
              prevValue.indexOf(decimalSymbol) !== -1 &&
              prevValue.indexOf(decimalSymbol) < lastCursorPostion
            ) {
              event.target.setSelectionRange(
                lastCursorPostion,
                lastCursorPostion
              );
            } else {
              let newCursorposition =
                prevValue.split(thousandsSymbol).length - 1 >
                newValue.split(thousandsSymbol).length - 1
                  ? lastCursorPostion - 1
                  : prevValue.split(thousandsSymbol).length - 1 ===
                    newValue.split(thousandsSymbol).length - 1
                  ? lastCursorPostion
                  : lastCursorPostion + 1;
              event.target.setSelectionRange(
                newCursorposition,
                newCursorposition
              );
            }
          });
      }
    } else {
      Promise.resolve()
        .then(() => {
          setErrorMessage("Character not allowed");
        })
        .then(() => {
          event.target.setSelectionRange(lastCursorPostion-1, lastCursorPostion-1);
        });
    }
  };

  return (
    <TextField
      error={ErrorMessage !== null}
      helperText={ErrorMessage ? ErrorMessage : ""}
      type="text"
      onChange={handleChange}
      value={Value}
      inputRef={inputRef}
    />
  );
};
