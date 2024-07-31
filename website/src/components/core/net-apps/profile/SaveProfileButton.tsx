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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fromHex, parseEther, parseUnits } from "viem";
import { useChainId } from "wagmi";
import { chainIdToOpenSeaChainString } from "@/app/utils";
import { STORAGE_CONTRACT } from "./constants";
import { ProfileContents } from "./types";

const TOASTS = {
  title: "Profile",
  success: "Your profile has been saved successfully on Net",
  error: "Failed to save your profile",
};

const BUTTONS = {
  default: "Save profile",
  pending: "Saving",
  success: "Saved",
};

type Props = { profileContents: ProfileContents; disabled?: boolean };

export default function SaveProfileButton(props: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const chainId = useChainId();

  // TODO validate profile chain
  const chainString = chainIdToOpenSeaChainString(chainId);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(updatedOpen) => setDialogOpen(updatedOpen)}
    >
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)} className="w-full">
          Save Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>TODO</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex">
          <DialogClose asChild>
            <Button className="flex-1 mr-2">Cancel</Button>
          </DialogClose>
          <SubmitTransactionButton
            className="flex-1"
            functionName="inscribe"
            abi={STORAGE_CONTRACT.abi}
            to={STORAGE_CONTRACT.address}
            args={["TODO"]}
            messages={{
              toasts: {
                ...TOASTS,
                success: (
                  <>
                    {TOASTS.success}
                    <Button
                      onClick={() => {
                        router.push("/TODO profile page");
                      }}
                    >
                      View profile
                    </Button>
                  </>
                ),
              },
              button: BUTTONS,
            }}
            useDefaultButtonMessageOnSuccess={true}
            onTransactionConfirmed={async (hash, logs) => {
              setDialogOpen(false);
              // Push to mint page for token id
              router.push(`/TODO profile page`);
            }}
            disabled={props.disabled}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
