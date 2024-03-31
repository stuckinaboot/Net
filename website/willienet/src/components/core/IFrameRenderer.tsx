export default function IframeRenderer({ htmlString }: { htmlString: string }) {
  return (
    <iframe
      className="bg-white"
      title="Rendered HTML"
      srcDoc={htmlString}
      style={{ width: "100%", height: "400px", border: "none" }}
    />
  );
}
