import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function DatetimePicker(props: {
  className?: string;
  selected: Date;
  onChange: (updated: Date) => void;
}) {
  return (
    <DatePicker
      className={cn("bg-background", props.className)}
      selected={props.selected}
      onChange={props.onChange}
      showTimeSelect
      dateFormat="Pp"
    />
  );
}
