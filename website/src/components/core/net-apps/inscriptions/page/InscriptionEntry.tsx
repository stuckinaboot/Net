import { Spacing, SpacingSize } from "@/components/core/Spacing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import FileUpload from "../../inscribed-drops/page/FileUpload";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import UploadMediaInput from "../UploadMediaInput";

export type MediaFiles = {
  image: File | undefined;
  animation: File | undefined;
};

export type InscriptionContents = {
  image?: string;
  name?: string;
  description?: string;
  animation_url?: string;
  traits?: any;
};

export default function InscriptionEntry(props: {
  onInscriptionChanged: (inscription: InscriptionContents) => void;
  onImageFileChanged: (file: File | undefined) => void;
  onAnimationFileChanged: (file: File | undefined) => void;
  additionalOptionalComponent?: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [animation, setAnimation] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [animationFile, setAnimationFile] = useState<File | undefined>();

  function updateInscription(params: {
    name: string;
    description: string;
    image: string;
    animation: string;
  }) {
    const final = {
      name: params.name,
      description: params.description,
      image: params.image,
      animation_url: params.animation,
    };
    props.onInscriptionChanged(final);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Label>
        <b>Choose image:</b>
      </Label>
      <UploadMediaInput
        value={image}
        file={imageFile}
        onChange={(value, file) => {
          if (file != null) {
            props.onImageFileChanged(file);

            const updatedFileName = file?.name || "";
            setImage(updatedFileName);
            setImageFile(file);
            updateInscription({
              name,
              description,
              image: updatedFileName,
              animation,
            });
            return;
          }
          // If manually editting the URL, clear the file
          setImageFile(undefined);
          props.onImageFileChanged(undefined);
          setImage(value);
          updateInscription({ name, description, image: value, animation });
        }}
      />
      {/* <Textarea
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setImage(updated);
          updateInscription({ name, description, image: updated, animation });
        }}
        value={image}
      />
      <FileUpload
        onFileSelected={(file) => {
          props.onImageFileChanged(file);

          const updatedFileName = file?.name || "";
          setImage(updatedFileName);
          updateInscription({
            name,
            description,
            image: updatedFileName,
            animation,
          });
        }}
      /> */}
      <Spacing size={SpacingSize.LARGE} />
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          Show optional fields
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <>
          <Spacing />
          <Label>
            <b>Name:</b>
          </Label>
          <Input
            onChange={(e) => {
              const updated = e.target.value;
              setName(updated);
              updateInscription({
                name: updated,
                description,
                image,
                animation,
              });
            }}
            value={name}
          />
          <Spacing />
          <Label>
            <b>Description:</b>
          </Label>
          <Textarea
            onChange={(e) => {
              const updated = e.target.value;
              setDescription(updated);
              updateInscription({
                name,
                description: updated,
                image,
                animation,
              });
            }}
            value={description}
          />
          <Spacing />
          <Label>
            <b>Choose animation:</b>
          </Label>
          <UploadMediaInput
            value={animation}
            file={animationFile}
            onChange={(value, file) => {
              if (file != null) {
                props.onAnimationFileChanged(file);

                const updatedFileName = file?.name || "";
                setAnimation(updatedFileName);
                setAnimationFile(file);
                updateInscription({
                  name,
                  description,
                  image,
                  animation: updatedFileName,
                });
                return;
              }
              // If manually editting the URL, clear the file
              setAnimationFile(undefined);
              props.onAnimationFileChanged(undefined);
              setAnimation(value);
              updateInscription({ name, description, image, animation: value });
            }}
          />
          {/* <Label>Animation URL (optional):</Label>
          <Textarea
            contentEditable
            onChange={(e) => {
              const updated = e.target.value;
              setAnimation(updated);
              updateInscription({
                name,
                description,
                image,
                animation: updated,
              });
            }}
            value={animation}
          /> */}
          <FileUpload
            onFileSelected={(file) => {
              props.onAnimationFileChanged(file);

              const updatedFileName = file?.name || "";
              setAnimation(updatedFileName);
              updateInscription({
                name,
                description,
                animation: updatedFileName,
                image,
              });
            }}
          />
          {props.additionalOptionalComponent ? (
            <>
              <Spacing />
              {props.additionalOptionalComponent}
            </>
          ) : undefined}
        </>
      </CollapsibleContent>
    </Collapsible>
  );
}
