import { Label } from "@/components/ui/label";
import Dropzone from "react-dropzone";

export default function FileUpload(props: {
  onFileSelected: (file: File | undefined) => void;
  file?: File;
}) {
  return (
    <Dropzone
      onDrop={(acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          props.onFileSelected(acceptedFiles[0]);
        }
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="border bg-background rounded p-3 min-h-32 text-center flex items-center justify-center">
            {props.file?.name ? (
              <Label className="flex">
                <b>File: {props.file ? props.file.name : "None"}</b>
                <br />
              </Label>
            ) : (
              <Label>
                Drop file here
                <br />
                <br />
                or click to upload
              </Label>
            )}
          </div>
        </div>
      )}
    </Dropzone>
  );
}
