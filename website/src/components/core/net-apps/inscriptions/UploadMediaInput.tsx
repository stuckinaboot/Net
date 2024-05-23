import { Input } from "@/components/ui/input";
import { Spacing, SpacingSize } from "../../Spacing";
import FileUpload from "../inscribed-drops/page/FileUpload";
import { Label } from "@/components/ui/label";

const SHOW_TEXT_INPUT = false;

export default function UploadMediaInput(props: {
  value?: string;
  file?: File;
  onChange?: (value: string, file?: File) => void;
}) {
  return (
    <div className="w-full max-w-sm items-center">
      <FileUpload
        file={props.file}
        onFileSelected={(file) => {
          props.onChange && props.onChange(file?.name || "", file);
        }}
      />
      {SHOW_TEXT_INPUT && (
        <>
          <Spacing size={SpacingSize.SMALL} />
          <Label>or</Label>
          <Spacing size={SpacingSize.SMALL} />
          <Input
            onChange={(e) => {
              const updated = e.target.value;
              props.onChange && props.onChange(updated);
            }}
            value={props.value}
            placeholder="Enter url manually..."
          />
        </>
      )}
    </div>
  );
}
