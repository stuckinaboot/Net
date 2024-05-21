import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import Dropzone from "react-dropzone";

export default function NftStorageUpload(props: {
  onUpload: (ipfsUrl: string) => void;
}) {
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function uploadToNftStorage() {
    if (file == null) {
      toast({ title: "Error", description: "No file selected" });
      return;
    }
    setUploading(true);
    // TODO upload file to backend
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploadToIpfs", {
      method: "POST",
      body,
    });
    const resJson = await res.json();

    setUploading(false);
    if (resJson.error) {
      toast({ title: "Error", description: resJson.error });
      return;
    }
    if (resJson.ipfsUrl) {
      console.log(resJson.ipfsUrl);
      toast({ title: "Success", description: "Uploaded to IPFS successfully" });
      props.onUpload(resJson.ipfsUrl);
    }
  }

  return (
    <>
      <Dropzone
        onDrop={(acceptedFiles) => {
          if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
          }
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div
              style={{
                backgroundColor: "#181717",
                borderRadius: "10px",
                padding: "30px",
              }}
            >
              <Label>
                <b>Selected image: {file ? file.name : "None"}</b>
              </Label>
              <br />
              Drag 'n' drop an image to this black area, or click here to select
              a new image. <br />
              <br />
              Then press "Upload to IPFS" and your image will be infused
            </div>
          </div>
        )}
      </Dropzone>
      <Button disabled={!file} onClick={uploadToNftStorage} variant="outline">
        {uploading ? <>Uploading...</> : "Upload to IPFS"}
      </Button>
    </>
  );
}
