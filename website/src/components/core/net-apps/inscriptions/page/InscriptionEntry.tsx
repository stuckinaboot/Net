import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function InscriptionEntry(props: {
  onInscriptionChanged: (inscriptionMessage: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [animation, setAnimation] = useState("");

  function Spacing() {
    return <div className="mt-4" />;
  }

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
        placeholder="My Cool Inscription"
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
        placeholder="A description of my cool inscription."
        onChange={(e) => {
          const updated = e.target.value;
          setDescription(updated);
          updateInscription({ name, description: updated, image, animation });
        }}
        value={description}
      />
      <Spacing />

      <Label>Image:</Label>
      <Textarea
        placeholder="https://example.com/image.png"
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setImage(updated);
          updateInscription({ name, description, image: updated, animation });
        }}
        value={image}
      />
      <Spacing />
      <Label>Animation (optional):</Label>
      <Textarea
        placeholder="https://example.com/animation.mp4"
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setAnimation(updated);
          updateInscription({ name, description, image, animation: updated });
        }}
        value={animation}
      />
    </>
  );
}
