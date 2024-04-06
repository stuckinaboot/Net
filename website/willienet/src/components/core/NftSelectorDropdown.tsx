import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NftSelectorItem = { tokenId: string; imgSrc: string };

export default function NftSelectorDropdown(props: {
  items: NftSelectorItem[];
  selectedItem: NftSelectorItem;
  onItemClicked: (item: NftSelectorItem) => void;
  className?: string;
}) {
  function renderItem(item: NftSelectorItem) {
    return (
      <div>
        #{item.tokenId}
        <img src={item.imgSrc} className="inline w-8" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn("min-w-56 hover:bg-transparent", props.className)}
          variant="outline"
        >
          Sending messages as
          <div className="px-1" /> {renderItem(props.selectedItem)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {props.items.map((item) => (
            <DropdownMenuItem
              key={item.tokenId}
              onClick={() => props.onItemClicked(item)}
            >
              {renderItem(item)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
