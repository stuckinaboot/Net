import SubmitTransactionButton from "@/components/core/SubmitTransactionButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { INSCRIPTIONS_CONTRACT, config } from "../InscriptionInferredAppConfig";

const TOASTS = {
  title: "Inscriptions",
  success: "Your art has been successfully inscribe on Net",
  error: "Failed to inscribe",
};

const BUTTONS = {
  default: "Inscribe",
  pending: "Inscribing",
  success: "Inscribed",
};

export default function InscribeButton(props: {
  inscription: string;
  disabled?: boolean;
}) {
  const DialogContents = config.dialogContents;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Inscribe</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            {<DialogContents message={props.inscription} />}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex">
          <DialogClose asChild>
            <Button className="flex-1 mr-2">Cancel</Button>
          </DialogClose>
          <SubmitTransactionButton
            className="flex-1"
            functionName="sendMessage"
            abi={INSCRIPTIONS_CONTRACT.abi}
            to={INSCRIPTIONS_CONTRACT.address}
            args={[props.inscription]}
            messages={{ toasts: TOASTS, button: BUTTONS }}
            useDefaultButtonMessageOnSuccess={true}
            onTransactionConfirmed={() => {}}
            prePerformTransasctionValidation={() => {
              // TODO check if message is valid
              return undefined;
            }}
            disabled={props.disabled}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
