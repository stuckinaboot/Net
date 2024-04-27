export default function FloatingScrollToBottomButton(props: {
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={props.onClick}
        className="absolute opacity-50 right-8 bottom-1 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full shadow-md"
      >
        ↓
      </button>
    </div>
  );
}
