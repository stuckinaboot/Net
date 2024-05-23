import { Label } from "@/components/ui/label";
import { useState } from "react";
import Dropzone from "react-dropzone";

export default function FileUpload(props: {
  onFileSelected: (file: File | undefined) => void;
}) {
  const [file, setFile] = useState<File>();

  return (
    <>
      <Dropzone
        onDrop={(acceptedFiles) => {
          if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            props.onFileSelected(acceptedFiles[0]);
          }
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <br />
            <div className="border bg-background rounded p-3">
              <Label>
                <b>Selected file: {file ? file.name : "None"}</b>
              </Label>
              <br />
              Drag 'n' drop file or click here
              <br />
              <br />
              Then press "Upload to IPFS" and your image will be infused
            </div>
          </div>
        )}
      </Dropzone>
    </>
  );
}
