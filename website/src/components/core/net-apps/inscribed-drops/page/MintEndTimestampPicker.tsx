import { Spacing } from "@/components/core/Spacing";
import DatetimePicker from "@/components/ui/DatetimePicker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

enum SelectorValues {
  OPEN_FOREVER = "Open Forever",
  TIMED = "Timed",
}

export default function MintEndTimestampPicker(props: {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}) {
  const [selected, setSelected] = useState(
    (props.value != null
      ? SelectorValues.TIMED
      : SelectorValues.OPEN_FOREVER
    ).toString()
  );

  return (
    <div>
      <RadioGroup
        value={selected}
        onValueChange={(value) => {
          setSelected(value);
          if (value === SelectorValues.OPEN_FOREVER) {
            props.onChange(undefined);
            return;
          }
          props.onChange(new Date());
        }}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={SelectorValues.OPEN_FOREVER} id="r1" />
          <Label htmlFor="r1">{SelectorValues.OPEN_FOREVER}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={SelectorValues.TIMED} id="r2" />
          <Label htmlFor="r2">{SelectorValues.TIMED}</Label>
        </div>
      </RadioGroup>
      {selected === SelectorValues.TIMED && props.value ? (
        // Justify center on small screens since otherwise the date picker UI gets cut off.
        // On larger screens, justify start because it looks nicer.
        <div className="flex flex-col justify-center md:justify-start">
          Choose mint end date:
          <br />
          <DatetimePicker selected={props.value} onChange={props.onChange} />
        </div>
      ) : (
        // Provide spacing as a buffer
        <Spacing />
      )}
    </div>
  );
}
