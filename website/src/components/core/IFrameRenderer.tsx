export default function IframeRenderer({
  htmlString,
  size,
}: {
  htmlString: string;
  size?: string;
}) {
  return (
    <iframe
      sandbox="allow-scripts"
      className="bg-white"
      title="Rendered HTML"
      srcDoc={htmlString}
      style={{ width: size || "100%", height: size || "400px", border: "none" }}
    />
  );
}
