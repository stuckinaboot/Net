export enum SpacingSize {
  SMALL = "mt-2",
  MEDIUM = "mt-4",
  LARGE = "mt-8",
}

export function Spacing(props: { size?: SpacingSize }) {
  return <div className={props.size || SpacingSize.MEDIUM} />;
}
