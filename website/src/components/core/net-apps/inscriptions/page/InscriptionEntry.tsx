import { Spacing } from "@/components/core/Spacing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import IpfsUpload from "../../inscribed-drops/page/IpfsUpload";

export default function InscriptionEntry(props: {
  onInscriptionChanged: (inscriptionMessage: string) => void;
  onImageFileChanged: (file: File | undefined) => void;
  onAnimationFileChanged: (file: File | undefined) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [animation, setAnimation] = useState("");

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
    const inscription = JSON.stringify(final);
    props.onInscriptionChanged(inscription);
  }

  return (
    <>
      <Label>Name:</Label>
      <Input
        onChange={(e) => {
          const updated = e.target.value;
          setName(updated);
          updateInscription({ name: updated, description, image, animation });
        }}
        value={name}
      />
      <Spacing />
      <Label>Description:</Label>
      <Textarea
        onChange={(e) => {
          const updated = e.target.value;
          setDescription(updated);
          updateInscription({ name, description: updated, image, animation });
        }}
        value={description}
      />
      <Spacing />
      <Label>Image URL:</Label>
      <Textarea
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setImage(updated);
          updateInscription({ name, description, image: updated, animation });
        }}
        value={image}
      />
      <IpfsUpload
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
      />
      <Spacing />
      <Label>Animation URL (optional):</Label>
      <Textarea
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setAnimation(updated);
          updateInscription({ name, description, image, animation: updated });
        }}
        value={animation}
      />
      <IpfsUpload
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
    </>
  );
}
